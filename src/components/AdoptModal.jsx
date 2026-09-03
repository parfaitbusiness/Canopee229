import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdoptModal({ arbre, onFermer, onSucces }) {
  const [nom, setNom] = useState('')
  const [type, setType] = useState('particulier')
  const [contact, setContact] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    if (!nom.trim() || !contact.trim()) {
      setErreur('Merci de renseigner ton nom et un contact (téléphone ou email).')
      return
    }
    setEnvoi(true)
    try {
      const { data: parrain, error: erreurParrain } = await supabase
        .from('parrains')
        .insert({ nom, type, contact })
        .select()
        .single()
      if (erreurParrain) throw erreurParrain

      const { error: erreurArbre } = await supabase
        .from('arbres')
        .update({ parrain_id: parrain.id })
        .eq('id', arbre.id)
      if (erreurArbre) throw erreurArbre

      onSucces(parrain)
    } catch (err) {
      setErreur("L'enregistrement a échoué. Vérifie ta connexion et réessaie.")
      console.error(err)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="modale-fond" role="dialog" aria-modal="true" aria-label="Devenir parrain">
      <div className="modale">
        <button className="fiche-fermer" onClick={onFermer} aria-label="Fermer">×</button>
        <h2>Devenir parrain de {arbre.code}</h2>
        <p className="fiche-info">
          Tu t'engages à visiter cet arbre régulièrement et à signaler son état sur la plateforme.
        </p>
        <form onSubmit={handleSubmit} className="formulaire">
          <label>
            Ton nom (ou celui de ton école / entreprise)
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : École Sainte-Rita" />
          </label>
          <label>
            Type de parrain
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="particulier">Particulier / famille</option>
              <option value="entreprise">Entreprise</option>
              <option value="ecole">École</option>
            </select>
          </label>
          <label>
            Téléphone ou email
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Ex : 97 00 00 00" />
          </label>
          {erreur && <p className="erreur">{erreur}</p>}
          <button className="btn-primaire" type="submit" disabled={envoi}>
            {envoi ? 'Enregistrement...' : 'Confirmer le parrainage'}
          </button>
        </form>
      </div>
    </div>
  )
}
