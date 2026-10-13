import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { afterEach, test } from 'node:test'
import { effectScope } from 'vue'
import ts from 'typescript'

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
}

const copySource = await readFile(new URL('../src/lib/copy.ts', import.meta.url), 'utf8')
const copyUrl = 'data:text/javascript;base64,' + Buffer.from(compile(copySource)).toString('base64')
const source = await readFile(new URL('../src/composables/useContact.ts', import.meta.url), 'utf8')
const moduleSource = compile(source)
  .replace(/from ['"]vue['"]/, `from '${import.meta.resolve('vue')}'`)
  .replace(/from ['"]\.\.\/lib\/copy['"]/, `from '${copyUrl}'`)
const { useContact } = await import('data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64'))
const payload = { name: 'Ana', email: 'ana@company.com', subject: 'Consulting', message: 'Hello', _hp_company_url: '' }
const originalFetch = globalThis.fetch
let scope

afterEach(() => {
  scope?.stop()
  globalThis.fetch = originalFetch
})

function createContact(language = 'en') {
  scope = effectScope()
  return scope.run(() => useContact(language))
}

function respond(status, body, headers = {}) {
  globalThis.fetch = async () => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', ...headers },
  })
}

test('201 is successful only when the API confirms the saved message', async () => {
  respond(201, { success: true, message: 'Message processed successfully.' })
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), true)
  assert.equal(contact.success.value, true)
  assert.equal(contact.notificationPending.value, false)
  assert.equal(contact.submitting.value, false)
})

test('202 confirms saved contact and explains pending mail without suggesting a resend', async () => {
  respond(202, { success: true, message: 'Saved', notification_status: 'pending' })
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), true)
  assert.equal(contact.notificationPending.value, true)
})

for (const [status, body] of [[200, { success: true, message: 'Unexpected' }], [201, { success: false }], [202, { success: true, message: 'Missing pending status' }]]) {
  test(`unexpected success contract ${status}: ${JSON.stringify(body)} is rejected`, async () => {
    respond(status, body)
    const contact = createContact()
    assert.equal(await contact.sendContact(payload), false)
    assert.equal(contact.success.value, false)
    assert.notEqual(contact.errorMessage.value, '')
  })
}

test('malformed successful JSON becomes a visible error and clears loading', async () => {
  globalThis.fetch = async () => new Response('<html>Proxy failure</html>', { status: 201 })
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), false)
  assert.equal(contact.submitting.value, false)
  assert.notEqual(contact.errorMessage.value, '')
})

test('422 displays only valid field errors and ignores arbitrary response fields', async () => {
  respond(422, { errors: { email: ['Email is invalid', 5], message: ['Message is required'], unexpected: ['Ignore me'] } })
  const contact = createContact('es')
  assert.equal(await contact.sendContact(payload), false)
  assert.deepEqual(contact.validationErrors.value, { email: ['Email is invalid'], message: ['Message is required'] })
  assert.match(contact.errorMessage.value, /Revisa los datos/)
})

test('422 remains a validation error when a proxy returns invalid JSON', async () => {
  globalThis.fetch = async () => new Response('invalid', { status: 422 })
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), false)
  assert.match(contact.errorMessage.value, /Review the form/)
})

test('429 respects Retry-After seconds', async () => {
  respond(429, {}, { 'Retry-After': '90' })
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), false)
  assert.match(contact.errorMessage.value, /Wait 2 min/)
})

test('429 supports an HTTP-date Retry-After header', async (context) => {
  context.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T00:00:00Z') })
  respond(429, {}, { 'Retry-After': 'Mon, 12 Oct 2026 00:03:00 GMT' })
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), false)
  assert.match(contact.errorMessage.value, /Wait 3 min/)
})

for (const status of [404, 405, 500, 503]) {
  test(`${status} keeps the form usable and shows a recoverable error`, async () => {
    respond(status, { message: 'Error' })
    const contact = createContact()
    assert.equal(await contact.sendContact(payload), false)
    assert.equal(contact.submitting.value, false)
    assert.notEqual(contact.errorMessage.value, '')
  })
}

test('offline failure does not break reactive state', async () => {
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  const contact = createContact()
  assert.equal(await contact.sendContact(payload), false)
  assert.equal(contact.submitting.value, false)
  assert.match(contact.errorMessage.value, /connection/)
})

test('double submit creates only one request', async () => {
  let complete
  let requests = 0
  globalThis.fetch = () => {
    requests++
    return new Promise(resolve => { complete = resolve })
  }
  const contact = createContact()
  const first = contact.sendContact(payload)
  assert.equal(contact.submitting.value, true)
  assert.equal(await contact.sendContact(payload), false)
  assert.equal(requests, 1)
  complete(new Response(JSON.stringify({ success: true, message: 'Saved' }), { status: 201 }))
  assert.equal(await first, true)
})

test('timeout aborts the request and warns against duplicate messages', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  })
  const contact = createContact()
  const result = contact.sendContact(payload)
  context.mock.timers.tick(15000)
  assert.equal(await result, false)
  assert.match(contact.errorMessage.value, /avoid duplicates/)
  assert.equal(contact.submitting.value, false)
})

test('disposing the component cancels a pending request without showing an error', async () => {
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  })
  const contact = createContact()
  const result = contact.sendContact(payload)
  scope.stop()
  assert.equal(await result, false)
  assert.equal(contact.errorMessage.value, '')
})

test('disposing while the response body is pending never reports a successful submit', async () => {
  let complete
  globalThis.fetch = async () => ({
    status: 201,
    json: () => new Promise(resolve => { complete = resolve }),
  })
  const contact = createContact()
  const result = contact.sendContact(payload)
  await Promise.resolve()
  scope.stop()
  complete({ success: true, message: 'Saved' })
  assert.equal(await result, false)
  assert.equal(contact.success.value, false)
})
