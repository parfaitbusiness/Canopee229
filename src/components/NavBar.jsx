const ONGLETS = [
  { id: 'carte', label: 'Carte', icone: '🌳' },
  { id: 'signaler', label: 'Signaler', icone: '⚠️' },
  { id: 'tableau', label: 'Tableau de bord', icone: '📊' }
]

export default function NavBar({ actif, onChange }) {
  return (
    <nav className="barre-nav" aria-label="Navigation principale">
      {ONGLETS.map((o) => (
        <button
          key={o.id}
          className={`nav-item ${actif === o.id ? 'nav-item-actif' : ''}`}
          onClick={() => onChange(o.id)}
          aria-current={actif === o.id ? 'page' : undefined}
        >
          <span aria-hidden="true" className="nav-icone">{o.icone}</span>
          <span>{o.label}</span>
        </button>
      ))}
    </nav>
  )
}
