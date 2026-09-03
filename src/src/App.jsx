import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import MapView from './components/MapView'
import TreeCard from './components/TreeCard'
import AdoptModal from './components/AdoptModal'
import ReportForm from './components/ReportForm'
import Dashboard from './components/Dashboard'
import OfflineBanner from './components/OfflineBanner'
import NavBar from './components/NavBar'
import { getQueue, trySync } from './lib/offlineQueue'
import './styles/index.css'

export default function App() {
  const [arbres, setArbres] = useState([])
  const [arbreSelectionne, setArbreSelectionne] = useState(null)
  const [modaleAdoption, setModaleAdoption] = useState(false)
  const [modaleSignalement, setModaleSignalement] = useState(false)
  const [positionSignalement, setPositionSignalement] = useState(null)
  const [ongletActif, setOngletActif] = useState('carte')
  const [enLigne, setEnLigne] = useState(navigator.onLine)
  const [enAttente, setEnAttente] = useState(0)
  const [message, setMessage] = useState('')

  const chargerArbres = useCallback(async () => {
    const { data, error } = await supabase.from('arbres_avec_details').select('*')
    if (!error && data) setArbres(data)
  }, [])

  useEffect(() => {
    chargerArbres()
  }, [chargerArbres])

  useEffect(() => {
    async function actualiserFile() {
      const q = await getQueue()
      setEnAttente(q.length)
    }
    actualiserFile()

    async function synchroniser() {
      const resultat = await trySync({
        signalement: async (payload) => {
          const { error } = await supabase.from('signalements').insert(payload)
          if (error) throw error
        },
        visite: async (payload) => {
          const { error } = await supabase.from('visites').insert(payload)
          if (error) throw error
        }
      })
      setEnAttente(resultat.remaining)
      if (resultat.synced > 0) chargerArbres()
    }

    function handleOnline() {
      setEnLigne(true)
      synchroniser()
    }
    function handleOffline() {
      setEnLigne(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (navigator.onLine) synchroniser()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [chargerArbres])

  function handleMapClick(latlng) {
    setPositionSignalement(latlng)
    setModaleSignalement(true)
  }

  return (
    <div className="app-conteneur">
      <header className="entete">
        <span aria-hidden="true">🌳</span>
        <div>
          <h1>CANOPÉE 229</h1>
          <p>La carte d'identité des arbres urbains</p>
        </div>
      </header>

      <OfflineBanner enLigne={enLigne} enAttente={enAttente} />

      <main className="zone-carte">
        <MapView
          arbres={arbres}
          onSelectArbre={setArbreSelectionne}
          modeSignalement={false}
          onMapClick={handleMapClick}
        />
      </main>

      {arbreSelectionne && (
        <TreeCard
          arbre={arbreSelectionne}
          onFermer={() => setArbreSelectionne(null)}
          onAdopter={() => setModaleAdoption(true)}
        />
      )}

      {modaleAdoption && arbreSelectionne && (
        <AdoptModal
          arbre={arbreSelectionne}
          onFermer={() => setModaleAdoption(false)}
          onSucces={() => {
            setModaleAdoption(false)
            setMessage('Parrainage confirmé. Merci pour ton engagement !')
            chargerArbres()
            setTimeout(() => setMessage(''), 4000)
          }}
        />
      )}

      {modaleSignalement && (
        <ReportForm
          position={positionSignalement}
          onFermer={() => {
            setModaleSignalement(false)
            setPositionSignalement(null)
          }}
          onSucces={async ({ horsLigne }) => {
            setModaleSignalement(false)
            setPositionSignalement(null)
            setMessage(
              horsLigne
                ? 'Signalement enregistré hors-ligne. Il sera envoyé automatiquement.'
                : 'Signalement envoyé, merci !'
            )
            const q = await getQueue()
            setEnAttente(q.length)
            setTimeout(() => setMessage(''), 4000)
          }}
        />
      )}

      {ongletActif === 'tableau' && <Dashboard onFermer={() => setOngletActif('carte')} />}

      {message && <div className="toast">{message}</div>}

      <button
        className="bouton-flottant"
        onClick={() => setModaleSignalement(true)}
        aria-label="Signaler un arbre"
        style={{ display: ongletActif === 'carte' ? 'flex' : 'none' }}
      >
        + Signaler
      </button>

      <NavBar
        actif={ongletActif}
        onChange={(id) => {
          setOngletActif(id)
          if (id === 'signaler') setModaleSignalement(true)
        }}
      />
    </div>
  )
}
