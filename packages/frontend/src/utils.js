export function formatDateTime(date) {
  return date.toLocaleString('fr-FR', {timeStyle: "short", timeZone: "Europe/Paris"})
}

export function formatDate(date) {
  return date.toLocaleString('fr-FR', { dateStyle: "short", timeZone: "Europe/Paris"})
}
