const { chromium } = require('playwright')
const assert = require('node:assert/strict')

async function run() {
  const { getUiCopy } = await import('../src/lib/uiCopy.ts')
  const args = process.env.GATEWAY_IP ? [`--host-resolver-rules=MAP localhost ${process.env.GATEWAY_IP}`] : []
  const browser = await chromium.launch({ args })
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' })
    await context.route('https://www.googletagmanager.com/**', route => route.abort())
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://localhost', { waitUntil: 'networkidle' })
    const rgb = hex => `rgb(${[1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)).join(', ')})`
    const normalize = value => value.replace(/\s+/g, ' ').trim()
    async function verifyCopy(lang) {
      const expected = getUiCopy(lang)
      for (const element of await page.locator('[data-i18n]').all()) {
        const key = await element.getAttribute('data-i18n')
        assert.equal(normalize(await element.textContent()), normalize(expected[key]), `${lang}: ${key}`)
      }
      assert.equal(await page.locator('html').getAttribute('lang'), lang)
      assert.equal(await page.locator('#langToggle').getAttribute('role'), 'switch')
      assert.equal(await page.locator('#langToggle').getAttribute('aria-checked'), String(lang === 'en'))
      assert.equal(await page.locator('#name').getAttribute('placeholder'), expected.ph_name)
      assert.equal(await page.locator('#message').getAttribute('placeholder'), expected.ph_msg)
      assert.equal(await page.locator('#heroCvBtn').getAttribute('href'), lang === 'es' ? '/Felix_Saucedo_CV_Base.pdf' : '/Felix_Saucedo_CV_Base_EN.pdf')
    }
    const api = {}
    for (const lang of ['es', 'en']) api[lang] = await (await context.request.get(`http://gateway/api/v1/portfolio?lang=${lang}`)).json()
    async function verifyProfessionalContent(lang) {
      const payload = api[lang]
      const hero = payload.hero
      assert.equal(normalize(await page.locator('h1').textContent()), hero.title)
      assert.equal(normalize(await page.locator('main > section').first().locator('p').first().textContent()), hero.body)
      const philosophies = page.locator('#como-pienso .grid > div')
      assert.equal(await philosophies.count(), payload.philosophies.length)
      for (const [index, item] of payload.philosophies.entries()) {
        const card = philosophies.nth(index)
        assert.equal(normalize(await card.locator('h3').textContent()), item.title)
        assert.equal(normalize(await card.locator('p').textContent()), item.body)
        assert.equal(normalize(await card.locator('span').first().textContent()), item.icon)
        assert.equal(await card.locator('span').first().evaluate(element => getComputedStyle(element).color), rgb(item.accent_color_hex))
      }
      const cases = page.locator('#decisiones .space-y-6 > div')
      assert.equal(await cases.count(), payload.case_studies.length)
      for (const [index, study] of payload.case_studies.entries()) {
        const card = cases.nth(index)
        assert.equal(normalize(await card.locator('h3').textContent()), study.title)
        assert.ok(normalize(await card.textContent()).includes(study.problem))
        assert.ok(normalize(await card.textContent()).includes(study.solution))
        assert.equal(normalize(await card.locator('span').first().textContent()), study.badge_text)
        assert.equal(await card.locator('span').first().evaluate(element => getComputedStyle(element).color), rgb(study.badge_color_hex))
      }
      const leaders = page.locator('#liderazgo .grid > div')
      assert.equal(await leaders.count(), payload.leadership.length)
      for (const [index, item] of payload.leadership.entries()) {
        assert.equal(normalize(await leaders.nth(index).locator('h4').textContent()), item.title)
        assert.equal(normalize(await leaders.nth(index).locator('p').textContent()), item.body)
      }
      await page.locator('[data-filter="all"]').click()
      const skills = payload.skills
      assert.equal(await page.locator('.tech-item').count(), skills.length)
      for (const [index, skill] of skills.entries()) {
        const spans = page.locator('.tech-item').nth(index).locator('span')
        assert.equal(normalize(await spans.nth(0).textContent()), skill.name)
        assert.equal(normalize(await spans.nth(1).textContent()), skill.subtitle)
        const dark = await page.locator('html').evaluate(element => element.classList.contains('dark'))
        assert.equal(await spans.nth(0).evaluate(element => getComputedStyle(element).color), dark ? 'rgb(241, 245, 249)' : 'rgb(15, 23, 42)')
        assert.equal(await spans.nth(1).evaluate(element => getComputedStyle(element).color), rgb(skill.accent_color))
      }
      const milestones = page.locator('main > section').nth(5).locator('.grid > div')
      assert.equal(await milestones.count(), payload.career.length)
      for (const [index, milestone] of payload.career.entries()) {
        const card = milestones.nth(index)
        assert.equal(normalize(await card.locator('span').textContent()), milestone.period)
        assert.equal(await card.locator('span').evaluate(element => getComputedStyle(element).color), rgb(milestone.accent_color_hex))
        assert.equal(normalize(await card.locator('p').first().textContent()), milestone.role)
        assert.ok(normalize(await card.locator('p').nth(1).textContent()).includes(milestone.company))
      }
    }
    for (const [width, titleHeight, bodyHeight] of [[390, '41.4px', '29.25px'], [768, '48px', '28px'], [1440, '60px', '28px']]) {
      await page.setViewportSize({ width, height: 900 })
      assert.equal(await page.locator('h1').evaluate(element => getComputedStyle(element).lineHeight), titleHeight)
      assert.equal(await page.locator('main > section').first().locator('p').first().evaluate(element => getComputedStyle(element).lineHeight), bodyHeight)
    }
    assert.equal(await page.locator('nav #langToggle, nav #themeToggle').count(), 0)
    assert.equal(await page.locator('#preferencesDock button').count(), 2)
    assert.equal(await page.locator('#preferencesDock').evaluate(element => getComputedStyle(element).position), 'fixed')
    await page.setViewportSize({ width: 320, height: 700 })
    assert.equal(await page.locator('#navCvBtn').isVisible(), true)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Small mobile horizontal overflow')
    await page.setViewportSize({ width: 1440, height: 900 })
    await verifyProfessionalContent('es')
    assert.equal(await page.getByRole('alert').count(), 0)
    await page.locator('.tech-item').first().hover()
    assert.equal(await page.locator('.tech-item').first().evaluate(element => getComputedStyle(element).borderTopColor), rgb(api.es.categories[0].default_accent_color))
    await verifyCopy('es')
    assert.equal(await page.locator('.tech-item').count(), 33)
    async function colors() {
      return page.evaluate(() => ({
        body: getComputedStyle(document.body).backgroundColor,
        card: getComputedStyle(document.querySelector('#como-pienso .grid > div')).backgroundColor,
        text: getComputedStyle(document.querySelector('h1')).color,
      }))
    }
    assert.deepEqual(await colors(), { body: 'rgb(9, 13, 22)', card: 'rgb(15, 23, 42)', text: 'rgb(241, 245, 249)' })
    await page.locator('#themeToggle').click()
    assert.deepEqual(await colors(), { body: 'rgb(248, 250, 252)', card: 'rgb(255, 255, 255)', text: 'rgb(15, 23, 42)' })
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal((await colors()).body, 'rgb(248, 250, 252)')
    await page.locator('#name').fill('Preserved input')
    await page.locator('#langToggle').focus()
    await page.keyboard.press('Space')
    await page.waitForLoadState('networkidle')
    await verifyCopy('en')
    await verifyProfessionalContent('en')
    assert.equal(await page.locator('#name').inputValue(), 'Preserved input')
    await page.locator('#themeToggle').click()
    await verifyCopy('en')
    await verifyProfessionalContent('en')
    assert.equal(await page.locator('#name').inputValue(), 'Preserved input')
    await page.reload({ waitUntil: 'networkidle' })
    await verifyCopy('en')
    await verifyProfessionalContent('en')
    assert.equal((await colors()).body, 'rgb(9, 13, 22)')
    for (const category of ['all', 'backend', 'data', 'cloud', 'api', 'quality']) {
      await page.locator(`[data-filter="${category}"]`).click()
      const visible = page.locator('.tech-item:visible')
      assert.ok(await visible.count() > 0)
      if (category !== 'all') for (const element of await visible.all()) assert.equal(await element.getAttribute('data-category'), category)
    }
    await page.locator('[data-filter="all"]').click()
    let status = 202
    let posted
    await page.route('**/api/v1/contact', async route => {
      posted = route.request().postDataJSON()
      assert.equal(route.request().headers().accept, 'application/json')
      assert.equal(route.request().headers()['content-type'], 'application/json')
      await route.fulfill({ status, headers: status === 429 ? { 'Retry-After': '180' } : {}, contentType: 'application/json', body: JSON.stringify(status === 422 ? { errors: { email: ['Invalid email'] } } : {}) })
    })
    for (status of [200, 201, 202, 422, 429, 500]) {
      await page.locator('#name').fill('QA audit')
      await page.locator('#email').fill('qa@example.com')
      await page.locator('#message').fill('Review the approved architecture and contact intake.')
      await page.locator('#submitBtn').click()
      if (status <= 202) {
        await page.getByText('✓ Message sent successfully.', { exact: true }).waitFor()
        assert.equal(await page.locator('#name').inputValue(), '')
      } else {
        await page.getByRole('alert').waitFor()
        assert.equal(await page.locator('#name').inputValue(), 'QA audit')
      }
      assert.equal(posted._hp_company_url, '')
    }
    await page.locator('#langToggle').click()
    await page.waitForLoadState('networkidle')
    assert.match(await page.getByRole('alert').innerText(), /No pude enviar/)
    await page.locator('#name').fill('')
    await page.locator('#email').fill('')
    await page.locator('#message').fill('')
    await page.reload({ waitUntil: 'networkidle' })
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: '/artifacts/preview-desktop.png', fullPage: true })
    await page.locator('#themeToggle').click()
    await page.screenshot({ path: '/artifacts/preview-light.png', fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: '/artifacts/preview-mobile.png', fullPage: true })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile horizontal overflow')
    const automatic = await context.newPage()
    automatic.on('pageerror', error => errors.push(error.message))
    await automatic.addInitScript(() => localStorage.removeItem('site_theme'))
    await automatic.emulateMedia({ colorScheme: 'light' })
    await automatic.goto('http://localhost', { waitUntil: 'networkidle' })
    assert.equal(await automatic.locator('html').evaluate(element => element.classList.contains('dark')), false)
    await automatic.emulateMedia({ colorScheme: 'dark' })
    await automatic.waitForFunction(() => document.documentElement.classList.contains('dark'))
    await automatic.locator('#themeToggle').click()
    await automatic.emulateMedia({ colorScheme: 'light' })
    await automatic.emulateMedia({ colorScheme: 'dark' })
    assert.equal(await automatic.locator('html').evaluate(element => element.classList.contains('dark')), false)
    const restricted = await context.newPage()
    restricted.on('pageerror', error => errors.push(error.message))
    await restricted.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied') } }))
    await restricted.goto('http://localhost', { waitUntil: 'networkidle' })
    await restricted.locator('#langToggle').click()
    await restricted.locator('#themeToggle').click()
    assert.equal(await restricted.locator('html').getAttribute('lang'), 'en')
    const recovery = await context.newPage()
    recovery.on('pageerror', error => errors.push(error.message))
    const fetchLogs = []
    recovery.on('console', message => {
      if (message.type() === 'error' && message.text().includes('[Portfolio Fetch Error]:')) fetchLogs.push(message.text())
    })
    await recovery.addInitScript(() => localStorage.setItem('site_lang', 'es'))
    let mode = 'failure'
    await recovery.route('**/api/v1/portfolio?*', route => route.fulfill({
      status: mode === 'failure' ? 500 : 200,
      contentType: 'application/json',
      body: JSON.stringify(mode === 'failure' ? { message: 'Simulated failure' } : mode === 'invalid' ? { data: { skills: null } } : { data: api.es }),
    }))
    await recovery.goto('http://localhost', { waitUntil: 'networkidle' })
    await recovery.getByRole('alert').waitFor()
    assert.equal(await recovery.locator('.tech-item').count(), 0)
    assert.ok(fetchLogs.some(message => message.includes('HTTP 500')))
    mode = 'invalid'
    await recovery.getByRole('button', { name: 'Volver a intentar' }).click()
    await recovery.getByRole('alert').waitFor()
    assert.ok(fetchLogs.some(message => message.includes('Invalid portfolio response')))
    mode = 'wrapped'
    await recovery.getByRole('button', { name: 'Volver a intentar' }).click()
    await recovery.locator('.tech-item').first().waitFor()
    assert.equal(await recovery.locator('.tech-item').count(), 33)
    assert.equal(await recovery.getByRole('alert').count(), 0)
    assert.equal(normalize(await recovery.locator('h1').textContent()), api.es.hero.title)

    const delayed = await context.newPage()
    delayed.on('pageerror', error => errors.push(error.message))
    let release
    const gate = new Promise(resolve => { release = resolve })
    await delayed.route('**/api/v1/portfolio?*', async route => {
      await gate
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(api.es) })
    })
    await delayed.goto('http://localhost', { waitUntil: 'domcontentloaded' })
    await delayed.getByRole('status').waitFor()
    assert.equal(await delayed.locator('.tech-item').count(), 0)
    assert.equal(await delayed.locator('#como-pienso .grid > div').count(), 0)
    release()
    await delayed.locator('.tech-item').first().waitFor()
    assert.equal(await delayed.getByRole('status').count(), 0)

    assert.deepEqual(errors, [])
    console.log('PASS: live API content in all 6 sections ES/EN, placeholders/CV links, exact light/dark colors, persisted language/theme, preserved input, 33 technologies, HEX accents/hover, API category filters, loading fallbacks and 500/invalid-payload recovery with wrapped responses, and contact headers/honeypot 200/201/202/422/429/500. Contact mocked; GTM blocked.')
  } finally { await browser.close() }
}
run().catch(error => { console.error(error); process.exit(1) })
