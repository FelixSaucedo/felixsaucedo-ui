import type { PortfolioResponse } from '../types/portfolio'

export function emptyPortfolio(): PortfolioResponse {
  return {
    hero: null,
    philosophies: [],
    case_studies: [],
    leadership: [],
    categories: [],
    skills: [],
    career: [],
  }
}
