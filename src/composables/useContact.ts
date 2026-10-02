/**
 * Félix Saucedo — Senior Software Engineer & Technical Lead
 * Portfolio Client UI (Vue 3.5 / Tailwind v4)
 * [https://github.com/FelixSaucedo](https://github.com/FelixSaucedo)
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

type ContactFailure = 'network' | 'timeout' | 'validation' | 'rate-limit' | null

export function useContact(language: MaybeRefOrGetter<Language> = 'es') {
  const submitting = ref(false)
  const received = ref(false)
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
      if (response.status >= 200 && response.status <= 202) {
        received.value = true
        return true
      }
      if (response.status === 429) {
        const retrySeconds = Number(response.headers.get('Retry-After'))
        retryMinutes.value =
          Number.isFinite(retrySeconds) && retrySeconds > 0
            ? Math.ceil(retrySeconds / 60)
            : 10
        failure.value = 'rate-limit'
      } else if (response.status === 422) {
        failure.value = 'validation'
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
    sendContact,
  }
}
