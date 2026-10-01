import type {
  CareerMilestone,
  CaseStudy,
  ContentBlock,
  Hero,
  Philosophy,
  PortfolioResponse,
  Skill,
  SkillCategory,
} from '../types/portfolio'

type Check = (value: unknown) => boolean

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const text: Check = (value) => typeof value === 'string'
const hex: Check = (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
const integer: Check = (value) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const nullable =
  (check: Check): Check =>
  (value) => value === null || check(value)
const list =
  (check: Check): Check =>
  (value) => Array.isArray(value) && value.every(check)
const shape =
  (fields: Record<string, Check>): Check =>
  (value) => record(value) && Object.entries(fields).every(
    ([key, check]) => Object.hasOwn(value, key) && check(value[key]),
  )

const hero = shape({
  title: nullable(text), body: nullable(text), badge: nullable(text),
} satisfies Record<keyof Hero, Check>)
const skill = shape({
  name: text, subtitle: nullable(text), category_slug: text, accent_color: hex,
} satisfies Record<keyof Skill, Check>)
const category = shape({
  id: integer, slug: text, name: nullable(text), default_accent_color: hex,
} satisfies Record<keyof SkillCategory, Check>)
const caseStudy = shape({
  title: nullable(text), badge_text: text, badge_color_hex: hex,
  problem: nullable(text), solution: nullable(text),
} satisfies Record<keyof CaseStudy, Check>)
const blockFields = {
  title: nullable(text), body: nullable(text),
} satisfies Record<keyof ContentBlock, Check>
const block = shape(blockFields)
const philosophy = shape({
  ...blockFields, icon: nullable(text), accent_color_hex: nullable(hex),
} satisfies Record<keyof Philosophy, Check>)
const milestone = shape({
  period: text, role: nullable(text), company: text, accent_color_hex: hex,
} satisfies Record<keyof CareerMilestone, Check>)
const portfolio = shape({
  hero: nullable(hero), philosophies: list(philosophy), case_studies: list(caseStudy),
  leadership: list(block), categories: list(category), skills: list(skill), career: list(milestone),
} satisfies Record<keyof PortfolioResponse, Check>)

export function parsePortfolio(value: unknown): PortfolioResponse {
  const payload = record(value) ? value.data ?? value : value
  const normalized = record(payload) ? { leadership: [], ...payload } : payload
  if (!portfolio(normalized)) throw new Error('Invalid portfolio response')
  return normalized as PortfolioResponse
}
