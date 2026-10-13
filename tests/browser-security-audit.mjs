import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
const revision = (await readdir('/ms-playwright')).find(name => /^chromium-\d+$/.test(name))
assert.ok(revision, 'A cached Chromium installation is required')
const browser = spawn(`/ms-playwright/${revision}/chrome-linux64/chrome`, [
  '--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9222',
  '--user-data-dir=/tmp/contact-security-audit',
  '--host-resolver-rules=' + [
    'MAP www.googletagmanager.com ~NOTFOUND', 'MAP fonts.googleapis.com ~NOTFOUND', 'MAP fonts.gstatic.com ~NOTFOUND',
    ...(process.env.QA_GATEWAY_IP ? [`MAP localhost ${process.env.QA_GATEWAY_IP}`] : []),
  ].join(', '),
], { stdio: 'ignore' })
let socket
let sequence = 0
const pending = new Map()
const pageErrors = []

try {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch('http://127.0.0.1:9222/json/version')).ok) break } catch {}
    await delay(100)
  }
  const target = await (await fetch('http://127.0.0.1:9222/json/new?http://localhost', { method: 'PUT' })).json()
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') pageErrors.push(message.params.exceptionDetails.text)
    const callback = pending.get(message.id)
    if (callback) {
      pending.delete(message.id)
      message.error ? callback.reject(message.error) : callback.resolve(message.result)
    }
  })
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  async function until(expression) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return
      await delay(100)
    }
    throw new Error(`Browser state did not settle: ${expression}; ${await evaluate("document.body.innerText.slice(0, 200)")}`)
  }
  await command('Runtime.enable')
  await command('Page.enable')
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await command('Page.navigate', { url: 'http://localhost/' })
  await until("!!document.querySelector('#contactForm') && document.querySelectorAll('.tech-item').length > 0")
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'Mobile horizontal overflow')
  assert.deepEqual(await evaluate(`(() => {
    const input = document.querySelector('[name="_hp_company_url"]')
    const style = getComputedStyle(input)
    return [style.position, style.left, input.tabIndex, input.getAttribute('aria-hidden')]
  })()`), ['absolute', '-9999px', -1, 'true'])
  assert.equal(await evaluate("document.querySelector('a[href=\"mailto:contacto@felixsaucedo.com\"]') !== null"), true)
  for (const file of ['Felix_Saucedo.pdf', 'Felix_Saucedo_EN.pdf']) {
    const result = await evaluate(`(async () => {
      const response = await fetch('/${file}')
      const bytes = new Uint8Array(await response.arrayBuffer())
      return [response.status, new TextDecoder().decode(bytes.slice(0, 5))]
    })()`)
    assert.deepEqual(result, [200, '%PDF-'])
  }
  await evaluate("localStorage.setItem('site_lang', 'en'); localStorage.setItem('site_theme', 'dark')")
  await command('Page.navigate', { url: 'http://localhost/' })
  await until("document.documentElement.lang === 'en' && !!document.querySelector('#contactForm')")
  await evaluate(`(() => {
    const realFetch = window.fetch.bind(window)
    window.__qaRequests = 0
    window.fetch = (url, options) => {
      if (url !== '/api/v1/contact') return realFetch(url, options)
      window.__qaRequests++
      window.__qaPayload = JSON.parse(options.body)
      const status = window.__qaStatus
      if (status === 'offline') return Promise.reject(new TypeError('Offline'))
      if (status === 'pending') return new Promise(resolve => { window.__qaResolve = resolve })
      const body = status === 201 ? { success: true, message: 'Saved' }
        : status === 202 ? { success: true, message: 'Saved', notification_status: 'pending' }
        : status === 422 ? { errors: { email: ['Invalid email'] } } : {}
      return Promise.resolve(new Response(JSON.stringify(body), {
        status, headers: { 'Content-Type': 'application/json', 'Retry-After': '180' },
      }))
    }
  })()`)
  async function submit(status) {
    await evaluate(`(() => {
      window.__qaStatus = ${JSON.stringify(status)}
      for (const [id, value] of [['name', 'QA audit'], ['email', 'qa@example.com'], ['message', 'Test message']]) {
        const input = document.getElementById(id)
        input.value = value
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const subject = document.getElementById('subject')
      subject.value = 'otro'
      subject.dispatchEvent(new Event('change', { bubbles: true }))
      document.querySelector('#contactForm').requestSubmit()
    })()`)
  }
  for (const status of [201, 202, 200, 422, 429, 500, 'offline']) {
    await submit(status)
    await until("document.querySelector('#submitBtn').disabled === false && !!document.querySelector('#formStatus, [role=alert]')")
    assert.equal(await evaluate("window.__qaPayload.subject"), 'Technical Chat / Question about my work')
    assert.equal(await evaluate("window.__qaPayload.locale"), 'en')
    assert.equal(await evaluate("window.__qaPayload.theme"), 'dark')
    if (status === 201 || status === 202) {
      assert.equal(await evaluate("document.querySelector('#name').value"), '')
      const text = await evaluate("document.querySelector('#formStatus').textContent")
      assert.match(text, status === 202 ? /pending/ : /received successfully/)
    } else {
      assert.equal(await evaluate("document.querySelector('#name').value"), 'QA audit')
      const text = await evaluate("document.querySelector('[role=alert]').textContent")
      assert.ok(text.trim())
      if (status === 422) assert.equal(await evaluate("document.querySelector('#email').getAttribute('aria-invalid')"), 'true')
      if (status === 429) assert.match(text, /3 min/)
    }
  }
  const before = await evaluate('window.__qaRequests')
  await submit('pending')
  await until("document.querySelector('#submitBtn').disabled === true")
  await evaluate("document.querySelector('#contactForm').requestSubmit()")
  assert.equal(await evaluate('window.__qaRequests'), before + 1)
  await evaluate("window.__qaResolve(new Response(JSON.stringify({success:true,message:'Saved'}), {status:201}))")
  await until("document.querySelector('#submitBtn').disabled === false")
  await command('Page.navigate', { url: 'http://localhost/missing/deep-route' })
  await until("!!document.querySelector('main a[href=\"/\"]') && document.querySelector('h1')?.textContent.includes('Page not found')")
  assert.equal(await evaluate("document.querySelector('meta[name=robots]').content"), 'noindex, nofollow')
  assert.deepEqual(pageErrors, [])
  console.log('PASS Chromium: live portfolio, mobile layout, honeypot, exact reason/language/theme, 201/202/200/422/429/500/offline, loading, double submit and deep-route 404. Contact requests mocked; no email sent.')
} finally {
  socket?.close()
  browser.kill('SIGTERM')
}
