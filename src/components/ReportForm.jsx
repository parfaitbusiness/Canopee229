import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { enqueue } from '../lib/offlineQueue'

const TYPES = [
  { valeur: 'nouvel_arbre', label: 'Arbre non répertorié' },
  { valeur: 'danger', label: 'Arbre en danger (coupe, maladie, sécheresse)' },
  { valeur: 'emplacement', label: "Proposer un emplacement de plantation" }
]

export default function ReportForm({ position, onFermer, onSucces }) {
  const [type, setType] = useState('nouvel_arbre')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    if (!description.trim()) {
      setErreur('Décris rapidement ce que tu as observé.')
      return
    }
    setEnvoi(true)
    const payload = {
      type,
      description,
      contact: contact || null,
      lat: position?.lat ?? null,
      lng: position?.lng ?? null,
      statut: 'nouveau'
    }
    try {
      if (!navigator.onLine) {
        await enqueue('signalement', payload)
        onSucces({ horsLigne: true })
        return
      }
      const { error } = await supabase.from('signalements').insert(payload)
      if (error) throw error
      onSucces({ horsLigne: false })
    } catch (err) {
      await enqueue('signalement', payload)
      onSucces({ horsLigne: true })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="modale-fond" role="dialog" aria-modal="true" aria-label="Signaler un arbre">
      <div className="modale">
        <button className="fiche-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        <h2>Signaler un arbre</h2>
        <p className="fiche-info">
          {position ? 'Emplacement sélectionné sur la carte.' : "Décris l'emplacement dans le champ ci-dessous."}
        </p>
        <form onSubmit={handleSubmit} className="formulaire">
          <label>
            Type de signalement
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.valeur} value={t.valeur}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex : grand manguier près du marché, feuilles jaunies"
            />
          </label>
          <label>
            Ton contact (facultatif)
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Téléphone ou email" />
          </label>
          {erreur && <p className="erreur">{erreur}</p>}
          <button className="btn-primaire" type="submit" disabled={envoi}>
            {envoi ? 'Envoi...' : 'Envoyer le signalement'}
          </button>
        </form>
      </div>
    </div>
  )
                                                               }
