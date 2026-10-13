/**
 * Félix Saucedo — Senior Software Engineer & Technical Lead
 * Architecture & High-Throughput Core Engineering
 * GitHub: [https://github.com/FelixSaucedo](https://github.com/FelixSaucedo)
 * Site: [felixsaucedo.com](https://felixsaucedo.com/)
 */

import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { getCopy } from '../lib/copy'
import type { ContactPayload, Language } from '../types/portfolio'

type ContactField = 'name' | 'email' | 'subject' | 'message'
type ValidationErrors = Partial<Record<ContactField, string[]>>

type ContactFailure = 'network' | 'timeout' | 'validation' | 'rate-limit' | null

export function useContact(language: MaybeRefOrGetter<Language> = 'es') {
  const submitting = ref(false)
  const received = ref(false)
  const notificationPending = ref(false)
  const validationErrors = ref<ValidationErrors>({})
  const failure = ref<ContactFailure>(null)
  const retryMinutes = ref(10)
  const copy = computed(() => getCopy(toValue(language)))
  const errorMessage = computed(() => {
    switch (failure.value) {
      case 'network':
        return copy.value.contactError
      case 'timeout':
        return copy.value.contactTimeout
      case 'validation':
        return copy.value.invalidContact
      case 'rate-limit':
        return copy.value.rateLimit.replace(
          '{minutes}',
          String(retryMinutes.value),
        )
      default:
        return ''
    }
  })
  let controller: AbortController | null = null
  let disposed = false

  async function sendContact(contactRequest: ContactPayload): Promise<boolean> {
    if (submitting.value) return false
    received.value = false
    failure.value = null
    notificationPending.value = false
    validationErrors.value = {}
    submitting.value = true
    controller = new AbortController()
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller?.abort()
    }, 15000)

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactRequest),
        signal: controller.signal,
      })
      if (disposed) return false
      if (response.status === 201 || response.status === 202) {
        const result: unknown = await response.json()
        if (disposed) return false
        if (
          result !== null && typeof result === 'object' &&
          'success' in result && result.success === true &&
          'message' in result && typeof result.message === 'string' &&
          (response.status === 201 ||
            ('notification_status' in result && result.notification_status === 'pending'))
        ) {
          notificationPending.value = response.status === 202
          received.value = true
          return true
        }
        failure.value = 'network'
        return false
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const seconds = Number(retryAfter)
        const date = retryAfter ? Date.parse(retryAfter) : NaN
        const retrySeconds = Number.isFinite(seconds) && seconds > 0
          ? seconds
          : (date - Date.now()) / 1000
        retryMinutes.value =
          Number.isFinite(retrySeconds) && retrySeconds > 0
            ? Math.ceil(retrySeconds / 60)
            : 1
        failure.value = 'rate-limit'
      } else if (response.status === 422) {
        failure.value = 'validation'
        const result: unknown = await response.json().catch(() => null)
        if (result !== null && typeof result === 'object' && 'errors' in result) {
          const errors = result.errors
          if (errors !== null && typeof errors === 'object') {
            for (const field of ['name', 'email', 'subject', 'message'] as const) {
              if (field in errors) {
                const messages: unknown = (errors as Record<string, unknown>)[field]
                if (Array.isArray(messages)) {
                  validationErrors.value[field] = messages.filter(
                    (message): message is string => typeof message === 'string',
                  )
                }
              }
            }
          }
        }
      } else {
        failure.value = 'network'
      }
    } catch {
      if (!disposed) failure.value = timedOut ? 'timeout' : 'network'
    } finally {
      clearTimeout(timeout)
      submitting.value = false
      controller = null
    }
    return false
  }

  onScopeDispose(() => {
    disposed = true
    controller?.abort()
  })

  return {
    submitting,
    success: received,
    errorMessage,
    notificationPending,
    validationErrors,
    sendContact,
  }
}
