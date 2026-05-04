export const formatEtat = (etat) => {
  const map = {
    'neuf': 'Neuf',
    'occasion': 'Occasion',
    'venue_propre': 'Venue propre',
    'reconditionné': 'Reconditionné',
    'pour_pieces': 'Pour pièces'
  }
  return map[etat] || etat
}

export const getEtatBadgeClass = (etat) => {
  return etat === 'neuf' ? 'badge-neuf' : 'badge-occasion'
}
