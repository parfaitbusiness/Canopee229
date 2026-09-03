export default function OfflineBanner({ enLigne, enAttente }) {
  if (enLigne && enAttente === 0) return null
  return (
    <div className={`bandeau ${enLigne ? 'bandeau-sync' : 'bandeau-hors-ligne'}`}>
      {!enLigne && <span>Hors connexion — les données seront envoyées dès le retour du réseau.</span>}
      {enLigne && enAttente > 0 && <span>Synchronisation de {enAttente} élément(s) en attente...</span>}
    </div>
  )
}
