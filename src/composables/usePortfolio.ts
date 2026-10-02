/**
 * Félix Saucedo — Senior Software Engineer & Technical Lead
 * Portfolio Client UI (Vue 3.5 / Tailwind v4)
 * [https://github.com/FelixSaucedo](https://github.com/FelixSaucedo)
 */

import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import { getCopy } from '../lib/copy'
import { emptyPortfolio } from '../lib/portfolio'
import { readPreference, writePreference } from '../lib/preferences'
import { parsePortfolio } from '../lib/portfolioContract'
import type {
  Language,
  PortfolioResponse,
} from '../types/portfolio'

const languageKey = 'site_lang'

function savedLanguage(): Language {
  const language = readPreference(languageKey) ?? readPreference('felix-portfolio-language')
  return language === 'en' ? 'en' : 'es'
}

export function usePortfolio() {
  const currentLang = ref<Language>(savedLanguage())
  const data = shallowRef<PortfolioResponse>(emptyPortfolio())
  const cache = new Map<Language, PortfolioResponse>()
  const loading = ref(false)
  const failure = ref<'network' | 'timeout' | null>(null)
  const error = computed(() =>
    failure.value
      ? getCopy(currentLang.value)[
          failure.value === 'timeout' ? 'timeout' : 'loadError'
        ]
      : null,
  )
  let pending: AbortController | null = null
  let sequence = 0

  async function fetchPortfolio(): Promise<void> {
    const requestId = ++sequence
    const language = currentLang.value
    pending?.abort()
    const controller = new AbortController()
    pending = controller
    loading.value = true
    failure.value = null
    let timedOut = false
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 12000)

    try {
      const response = await fetch(
        `/api/v1/portfolio?lang=${language}`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      )
      if (!response.ok) throw new Error(`Portfolio request failed: HTTP ${response.status}`)
      const portfolio = parsePortfolio(await response.json())
      if (requestId === sequence) {
        cache.set(language, portfolio)
        data.value = portfolio
      }
    } catch (requestError) {
      if (requestId === sequence && (!controller.signal.aborted || timedOut)) {
        console.error('[Portfolio Fetch Error]:', requestError)
        failure.value = timedOut ? 'timeout' : 'network'
      }
    } finally {
      clearTimeout(timeout)
      if (requestId === sequence) {
        loading.value = false
        pending = null
      }
    }
  }

  function toggleLanguage(): void {
    currentLang.value = currentLang.value === 'es' ? 'en' : 'es'
  }

  watch(
    currentLang,
    (language) => {
      data.value = cache.get(language) ?? emptyPortfolio()
      writePreference(languageKey, language)
      document.documentElement.lang = language
      void fetchPortfolio()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    sequence++
    pending?.abort()
  })

  return { data, loading, error, currentLang, fetchPortfolio, toggleLanguage }
}
