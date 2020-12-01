import config from '@/config'

function parseDate (dateString: string | number): Date {
  if (typeof dateString === 'number') {
    return new Date(dateString * 1000)
  }
  return new Date(dateString)
}

export function formatShort (dateString: string | number) {
  return parseDate(dateString).toLocaleDateString('fr-Fr', config.app.dateFormatShort)
}

export function formatDateTimeShort (dateString: string | number) {
  return parseDate(dateString).toLocaleDateString('fr-Fr', { ...config.app.dateFormatShort, ...config.app.timeFormat })
}

export function formatLong (dateString: string | number) {
  return parseDate(dateString).toLocaleDateString('fr-Fr', config.app.dateFormatLong)
}

export function formatDateTimeLong (dateString: string | number) {
  return parseDate(dateString).toLocaleDateString('fr-Fr', { ...config.app.dateFormatLong, ...config.app.timeFormat })
}