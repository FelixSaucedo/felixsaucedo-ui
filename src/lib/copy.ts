import type { Language } from '../types/portfolio'

const es = {
  loading: 'Cargando portafolio…',
  retry: 'Volver a intentar',
  loadError: 'No pude cargar el portafolio. Intenta nuevamente.',
  timeout: 'La conexión está tardando más de lo esperado. Intenta nuevamente.',
  contactError: 'No pude enviar el mensaje. Revisa tu conexión e intenta nuevamente.',
  contactTimeout:
    'No pude confirmar la recepción. Espera antes de reenviar para evitar duplicados.',
  invalidContact: 'Revisa los datos del formulario antes de enviar.',
  rateLimit:
    'Has enviado varias solicitudes. Espera {minutes} min antes de intentar otra vez.',
}

type Copy = { [Key in keyof typeof es]: string }

const en: Copy = {
  loading: 'Loading portfolio…',
  retry: 'Try again',
  loadError: 'I couldn’t load the portfolio. Please try again.',
  timeout: 'The connection is taking longer than expected. Please try again.',
  contactError: 'I couldn’t send the message. Check your connection and try again.',
  contactTimeout:
    'I couldn’t confirm receipt. Wait before sending again to avoid duplicates.',
  invalidContact: 'Review the form details before sending.',
  rateLimit: 'You’ve sent several requests. Wait {minutes} min before trying again.',
}

export function getCopy(language: Language): Copy {
  return language === 'en' ? en : es
}
