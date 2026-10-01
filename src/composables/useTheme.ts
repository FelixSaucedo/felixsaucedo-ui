import { onScopeDispose, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const currentTheme = ref<Theme>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  let explicitPreference = false
  try {
    const saved = localStorage.getItem('site_theme')
    explicitPreference = saved === 'light' || saved === 'dark'
  } catch {}

  function applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }

  function followSystem(event: MediaQueryListEvent): void {
    if (!explicitPreference)
      currentTheme.value = event.matches ? 'dark' : 'light'
  }

  function toggleTheme(): void {
    explicitPreference = true
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem('site_theme', currentTheme.value)
    } catch {}
  }

  watch(currentTheme, applyTheme, { immediate: true, flush: 'sync' })
  media.addEventListener('change', followSystem)
  onScopeDispose(() => media.removeEventListener('change', followSystem))

  return { currentTheme, toggleTheme }
}
