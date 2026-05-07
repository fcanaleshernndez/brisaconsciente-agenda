export function formatSpanishDate(date: any): string {
  if (!date) return ''
  const d = new Date(date)
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d)
}

export function formatSpanishTime(date: any): string {
  if (!date) return ''
  const d = new Date(date)
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d)
}
