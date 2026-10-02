import type { Language } from '../types/portfolio'

const es = {
  btn_cv_full: 'Descargar CV Base',
  btn_cv_full_details: 'Ver CV completo con detalles',
  btn_cv_short: 'CV',
  btn_send: 'Enviar mensaje',
  btn_talk: 'Hablemos',
  contact_desc:
    'Cuéntame sobre tu equipo, proyecto o desafío técnico.',
  contact_tag: 'Contacto Directo',
  contact_title: 'Conversemos sobre tu equipo o proyecto',
  field_email: 'Tu Correo *',
  field_message: 'Mensaje *',
  field_name: 'Tu Nombre *',
  field_subject: 'Motivo de Contacto',
  footer_copy:
    '© 2026 Félix Saucedo · Diseñado para complementar mi perfil profesional.',
  inbox_alt: 'O escribe directamente a mi bandeja:',
  label_decision: 'La decisión aplicada:',
  label_problem: 'El dilema técnico:',
  nav_decisions: 'Criterio Técnico',
  nav_how_work: 'Cómo trabajo',
  nav_leadership: 'Liderazgo',
  nav_stack: 'Ecosistema',
  opt_consult: 'Consultoría o desarrollo técnico',
  opt_job: 'Oportunidad laboral (Senior / Lead Hands-on)',
  opt_other: 'Conversación técnica / Pregunta sobre mi trabajo',
  ph_msg:
    'Cuéntame sobre el desafío técnico o la posición que buscan cubrir...',
  ph_name: 'Ej: Marcela Gómez',
  sec1_desc:
    'Las herramientas cambian, pero los hábitos de ingeniería que evitan incendios en producción son constantes.',
  sec1_tag: 'Detrás del CV',
  sec1_title: 'Mi filosofía de trabajo en el día a día',
  sec2_desc:
    'En un CV se listan tecnologías; aquí explico el razonamiento técnico detrás de su elección.',
  sec2_tag: 'Criterio en Producción',
  sec2_title: 'Trade-offs y decisiones que justifican el stack',
  sec3_desc:
    'No creo en el liderazgo desde torres de marfil ni en jefaturas desconectadas de la consola. Cuando guío un equipo técnico, aplico tres reglas fundamentales:',
  sec3_tag: 'Liderazgo & Colaboración',
  sec3_title: 'Cómo aporto al equipo como Lead Hands-on',
  sec4_desc:
    'En el CV resumo mi stack prioritario; aquí reflejo el abanico completo de lenguajes, motores, infraestructura, testing y protocolos con los que he construido soluciones en producción.',
  sec4_tag: 'Ecosistema Técnico',
  sec4_title: 'Herramientas & Tecnologías a lo largo del tiempo',
  sec5_tag: 'Resumen Curricular',
  sec5_title: 'Línea de Tiempo Sintética',
  tab_all: 'Todos',
} as const

export type UiCopy = { [Key in keyof typeof es]: string }

const en: UiCopy = {
  btn_cv_full: 'Download Base Resume (EN)',
  btn_cv_full_details: 'View complete resume details',
  btn_cv_short: 'Resume',
  btn_send: 'Send Message',
  btn_talk: "Let's Talk",
  contact_desc: 'Tell me about your team, project, or engineering challenge.',
  contact_tag: 'Direct Contact',
  contact_title: "Let's discuss your team or next project",
  field_email: 'Your Email *',
  field_message: 'Message *',
  field_name: 'Your Name *',
  field_subject: 'Contact Reason',
  footer_copy:
    '© 2026 Félix Saucedo · Designed to complement my professional engineering profile.',
  inbox_alt: 'Or reach out directly via email:',
  label_decision: 'The implemented strategy:',
  label_problem: 'The technical dilemma:',
  nav_decisions: 'Technical Decisions',
  nav_how_work: 'Ways of Working',
  nav_leadership: 'Leadership',
  nav_stack: 'Ecosystem',
  opt_consult: 'Consulting or Technical Development',
  opt_job: 'Job Opportunity (Senior / Hands-on Lead)',
  opt_other: 'Technical Chat / Question about my work',
  ph_msg: 'Tell me about the engineering challenge or open role...',
  ph_name: 'e.g. Sarah Jenkins',
  sec1_desc:
    'Tools and stacks evolve, but the engineering disciplines that prevent production fires remain constant.',
  sec1_tag: 'Beyond the Resume',
  sec1_title: 'My day-to-day engineering mindset',
  sec2_desc:
    'Resumes list technologies; here I share the practical reasoning behind each engineering choice.',
  sec2_tag: 'Production Judgement',
  sec2_title: 'Trade-offs and architectural rationale',
  sec3_desc:
    "I don't believe in ivory-tower leadership or managers alienated from code. When leading engineering teams, I apply three core principles:",
  sec3_tag: 'Leadership & Collaboration',
  sec3_title: 'How I contribute as a Hands-on Lead',
  sec4_desc:
    'My resume highlights primary tools; here is the broader spectrum of languages, engines, cloud services, and protocols I have operated in production.',
  sec4_tag: 'Technical Ecosystem',
  sec4_title: 'Tools & Technologies across my career',
  sec5_tag: 'Career Summary',
  sec5_title: 'High-level Timeline',
  tab_all: 'All',
}

export function getUiCopy(language: Language): UiCopy {
  return language === 'en' ? en : es
}
