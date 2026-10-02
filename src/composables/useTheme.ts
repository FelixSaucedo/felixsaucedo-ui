import { onScopeDispose, ref, watch } from 'vue'
import { readPreference, writePreference } from '../lib/preferences'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const currentTheme = ref<Theme>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
  const savedTheme = readPreference('site_theme')
  let explicitPreference = savedTheme === 'light' || savedTheme === 'dark'

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
    writePreference('site_theme', currentTheme.value)
  }

  watch(currentTheme, applyTheme, { immediate: true, flush: 'sync' })
  systemTheme.addEventListener('change', followSystem)
  onScopeDispose(() => systemTheme.removeEventListener('change', followSystem))

  return { currentTheme, toggleTheme }
}
