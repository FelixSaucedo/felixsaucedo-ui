import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import { getCopy } from '../lib/copy'
import { emptyPortfolio } from '../lib/portfolio'
import { parsePortfolio } from '../lib/portfolioContract'
import type {
  Language,
  PortfolioResponse,
} from '../types/portfolio'

const languageKey = 'site_lang'

function savedLanguage(): Language {
  try {
    const saved =
      localStorage.getItem(languageKey) ??
      localStorage.getItem('felix-portfolio-language')
    return saved === 'en' ? 'en' : 'es'
  } catch {
    return 'es'
  }
}

function persistLanguage(language: Language): void {
  try {
    localStorage.setItem(languageKey, language)
  } catch {
    return
  }
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
      const payload = parsePortfolio(await response.json())
      if (requestId === sequence) {
        cache.set(language, payload)
        data.value = payload
      }
    } catch (err) {
      if (requestId === sequence && (!controller.signal.aborted || timedOut)) {
        console.error('[Portfolio Fetch Error]:', err)
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
      persistLanguage(language)
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
