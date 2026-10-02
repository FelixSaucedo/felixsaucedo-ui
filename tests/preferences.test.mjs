import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { readPreference, writePreference } from '../src/lib/preferences.ts'

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

afterEach(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage)
  else delete globalThis.localStorage
})

test('preferences round-trip through browser storage', () => {
  const preferences = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => preferences.get(key) ?? null,
      setItem: (key, preference) => preferences.set(key, preference),
    },
  })

  assert.equal(readPreference('site_theme'), null)
  writePreference('site_theme', 'dark')
  assert.equal(readPreference('site_theme'), 'dark')
})

test('blocked browser storage allows preferences to apply in memory', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new DOMException('Storage denied', 'SecurityError') },
  })

  assert.equal(readPreference('site_lang'), null)
  assert.doesNotThrow(() => writePreference('site_lang', 'en'))
})

test('a storage quota failure does not prevent changing a preference', () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => 'es',
      setItem() { throw new DOMException('Quota exceeded', 'QuotaExceededError') },
    },
  })

  assert.equal(readPreference('site_lang'), 'es')
  assert.doesNotThrow(() => writePreference('site_lang', 'en'))
})
