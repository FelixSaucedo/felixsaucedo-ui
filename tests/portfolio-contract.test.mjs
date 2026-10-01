import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { parsePortfolio } from '../src/lib/portfolioContract.ts'
import { emptyPortfolio } from '../src/lib/portfolio.ts'

let responses

before(async () => {
  const base = process.env.PORTFOLIO_TEST_API_URL ?? 'http://gateway/api/v1/portfolio'
  responses = await Promise.all(['es', 'en'].map(async language => {
    const response = await fetch(`${base}?lang=${language}`)
    assert.equal(response.status, 200)
    return response.json()
  }))
})

test('the live ES and EN responses satisfy the flat HEX contract', () => {
  for (const payload of responses) {
    const parsed = parsePortfolio(payload)
    assert.equal(parsed.skills.length, 33)
    assert.equal(parsed.categories.length, 5)
    assert.equal(parsed.philosophies.length, 4)
    assert.equal(parsed.case_studies.length, 2)
    assert.equal(parsed.career.length, 3)
    assert.equal(parsed.skills[0].accent_color, '#38bdf8')
    assert.equal(parsed.case_studies[1].badge_color_hex, '#10b981')
    assert.equal(parsed.career[2].accent_color_hex, '#c084fc')
  }
  assert.equal(parsePortfolio(responses[0]).hero.badge, 'Senior Software Engineer & Lead Hands-on')
  assert.equal(parsePortfolio(responses[1]).hero.badge, 'Senior Software Engineer & Hands-on Lead')
  assert.equal(parsePortfolio(responses[0]).categories[1].name, 'Datos & Caché')
  assert.equal(parsePortfolio(responses[1]).categories[1].name, 'Data & Cache')
})

test('a JsonResource data wrapper resolves to the same portfolio', () => {
  assert.deepEqual(parsePortfolio({ data: responses[0] }), parsePortfolio(responses[0]))
})

test('null optional content and an absent leadership section are safe to render', () => {
  const payload = structuredClone(responses[0])
  payload.hero = null
  payload.philosophies[0].icon = null
  payload.philosophies[0].body = null
  payload.philosophies[0].accent_color_hex = null
  delete payload.leadership
  const parsed = parsePortfolio(payload)
  assert.equal(parsed.hero, null)
  assert.deepEqual(parsed.leadership, [])
  assert.equal(parsed.philosophies[0].accent_color_hex, null)
})

test('missing required arrays, invalid content and non-HEX colors are rejected', () => {
  const payload = structuredClone(responses[0])
  delete payload.skills
  assert.throws(() => parsePortfolio(payload), /Invalid portfolio response/)
  payload.skills = responses[0].skills
  payload.philosophies[0].body = { unexpected: 'object' }
  assert.throws(() => parsePortfolio(payload), /Invalid portfolio response/)
  payload.philosophies = responses[0].philosophies
  payload.skills = structuredClone(responses[0].skills)
  payload.skills[0].accent_color = 'text-sky-600'
  assert.throws(() => parsePortfolio(payload), /Invalid portfolio response/)
  assert.throws(() => parsePortfolio(null), /Invalid portfolio response/)
})

test('loading and failed fetch fallbacks contain independent empty arrays', () => {
  const first = emptyPortfolio()
  const second = emptyPortfolio()
  assert.deepEqual(parsePortfolio(first), {
    hero: null, philosophies: [], case_studies: [], leadership: [], categories: [], skills: [], career: [],
  })
  for (const key of ['philosophies', 'case_studies', 'leadership', 'categories', 'skills', 'career']) {
    assert.notEqual(first[key], second[key])
  }
})
