import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard({ onFermer }) {
  const [quartiers, setQuartiers] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    async function charger() {
      setChargement(true)
      setErreur('')
      const { data, error } = await supabase.from('tableau_de_bord_quartiers').select('*')
      if (error) {
        setErreur('Impossible de charger le tableau de bord pour le moment.')
        console.error(error)
      } else {
        setQuartiers(data || [])
      }
      setChargement(false)
    }
    charger()
  }, [])

  return (
    <div className="modale-fond" role="dialog" aria-modal="true" aria-label="Tableau de bord territorial">
      <div className="modale modale-large">
        <button className="fiche-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        <h2>Tableau de bord territorial</h2>
        <p className="fiche-info">
          Taux de survie des arbres plantés (TSAP) et indice de couverture végétale (ICVQ), par quartier.
        </p>

        {chargement && <p>Chargement...</p>}
        {erreur && <p className="erreur">{erreur}</p>}

        {!chargement && !erreur && (
          <div className="tableau-quartiers">
            {quartiers.map((q) => (
              <div key={q.quartier_id} className="carte-quartier">
                <h3>{q.quartier_nom}</h3>
                <div className="stat-ligne">
                  <span>TSAP à 3 mois</span>
                  <strong>{q.tsap_3_mois != null ? `${q.tsap_3_mois}%` : '—'}</strong>
                </div>
                <div className="stat-ligne">
                  <span>TSAP à 6 mois</span>
                  <strong>{q.tsap_6_mois != null ? `${q.tsap_6_mois}%` : '—'}</strong>
                </div>
                <div className="stat-ligne">
                  <span>TSAP à 12 mois</span>
                  <strong>{q.tsap_12_mois != null ? `${q.tsap_12_mois}%` : '—'}</strong>
                </div>
                <div className="stat-ligne">
                  <span>ICVQ (arbres vivants / km²)</span>
                  <strong>{q.icvq != null ? q.icvq : '—'}</strong>
                </div>
              </div>
            ))}
            {quartiers.length === 0 && <p>Aucune donnée pour le moment.</p>}
          </div>
        )}
      </div>
    </div>
  )
                                  }
