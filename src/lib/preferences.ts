export function readPreference(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writePreference(key: string, preference: string): void {
  try {
    localStorage.setItem(key, preference)
  } catch {
    // Restricted storage must not prevent preferences from applying in memory.
    return
  }
}
