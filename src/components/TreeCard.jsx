const LABELS = {
  bon: 'En bonne santé',
  souffrance: 'En souffrance',
  disparu: 'Disparu'
}

const COULEURS = {
  bon: '#3B6D11',
  souffrance: '#EF9F27',
  disparu: '#888780'
}

export default function TreeCard({ arbre, onFermer, onAdopter }) {
  if (!arbre) return null
  const dejaParraine = !!arbre.parrain_id

  return (
    <div className="fiche-arbre">
      <button className="fiche-fermer" onClick={onFermer} aria-label="Fermer la fiche">
        ×
      </button>
      {arbre.photo_url && (
        <img src={arbre.photo_url} alt={`Photo de ${arbre.code}`} className="fiche-photo" />
      )}
      <div className="fiche-entete">
        <h2>{arbre.code}</h2>
        <span className="fiche-badge" style={{ background: COULEURS[arbre.statut] }}>
          {LABELS[arbre.statut]}
        </span>
      </div>
      <p className="fiche-espece">{arbre.espece} — quartier {arbre.quartier_nom}</p>

      <dl className="fiche-details">
        <div>
          <dt>Planté le</dt>
          <dd>{new Date(arbre.date_plantation).toLocaleDateString('fr-FR')}</dd>
        </div>
        <div>
          <dt>Visites confirmées</dt>
          <dd>{arbre.nb_visites ?? 0}</dd>
        </div>
        <div>
          <dt>Parrain</dt>
          <dd>{dejaParraine ? arbre.parrain_nom : 'Aucun — arbre libre'}</dd>
        </div>
      </dl>

      {!dejaParraine ? (
        <button className="btn-primaire" onClick={() => onAdopter(arbre)}>
          Devenir parrain de cet arbre
        </button>
      ) : (
        <p className="fiche-info">Cet arbre est déjà suivi par un parrain.</p>
      )}
    </div>
  )
}
