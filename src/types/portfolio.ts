export type Language = 'es' | 'en'

export interface Hero {
  title: string | null
  body: string | null
  badge: string | null
}

export interface Skill {
  name: string
  subtitle: string | null
  category_slug: string
  accent_color: string
}

export interface SkillCategory {
  id: number
  slug: string
  name: string | null
  default_accent_color: string
}

export interface CaseStudy {
  title: string | null
  badge_text: string
  badge_color_hex: string
  problem: string | null
  solution: string | null
}

export interface ContentBlock {
  title: string | null
  body: string | null
}

export interface Philosophy extends ContentBlock {
  icon: string | null
  accent_color_hex: string | null
}

export interface CareerMilestone {
  period: string
  role: string | null
  company: string
  accent_color_hex: string
}

export interface PortfolioResponse {
  hero: Hero | null
  philosophies: Philosophy[]
  case_studies: CaseStudy[]
  leadership: ContentBlock[]
  categories: SkillCategory[]
  skills: Skill[]
  career: CareerMilestone[]
}

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  _hp_company_url: string
}

export type ContactField = Exclude<keyof ContactPayload, '_hp_company_url'>
export type ContactErrors = Partial<Record<ContactField, string>>
