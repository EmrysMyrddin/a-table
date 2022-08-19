export function formatDateTime(date) {
  return new Date(date).toLocaleString('fr-FR', {timeStyle: "short", timeZone: "Europe/Paris"})
}

export function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR', { month: "2-digit", day: '2-digit', timeZone: "Europe/Paris"})
}

export function formatNumber(number) {
  return (number || 0).toLocaleString('fr-FR', {maximumFractionDigits: 0})
}
