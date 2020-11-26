import config from '@/config'

export function formatShort (dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-Fr', config.app.dateFormatShort)
}

export function formatDateTimeShort (dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-Fr', { ...config.app.dateFormatShort, ...config.app.timeFormat })
}

export function formatLong (dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-Fr', config.app.dateFormatLong)
}

export function formatDateTimeLong (dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-Fr', { ...config.app.dateFormatLong, ...config.app.timeFormat })
}