export function formatDateTime(date) {
  return date.toLocaleString('fr-FR', {timeStyle: "short", timeZone: "Europe/Paris"})
}

export function formatDate(date) {
  return date.toLocaleString('fr-FR', { month: "2-digit", day: '2-digit', timeZone: "Europe/Paris"})
}
