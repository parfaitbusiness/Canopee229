import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const COULEURS = {
  bon: '#3B6D11',
  souffrance: '#EF9F27',
  disparu: '#888780'
}

const LABELS = {
  bon: 'En bonne santé',
  souffrance: 'En souffrance',
  disparu: 'Disparu'
}

const CENTRE_COTONOU = [6.3703, 2.3912]

function ClicPourSignaler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng)
    }
  })
  return null
}

export default function MapView({ arbres, onSelectArbre, modeSignalement, onMapClick }) {
  return (
    <MapContainer
      center={CENTRE_COTONOU}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {modeSignalement && <ClicPourSignaler onMapClick={onMapClick} />}
      {arbres.map((arbre) => (
        <CircleMarker
          key={arbre.id}
          center={[arbre.lat, arbre.lng]}
          radius={9}
          pathOptions={{
            color: '#fff',
            weight: 2,
            fillColor: COULEURS[arbre.statut] || COULEURS.disparu,
            fillOpacity: 1
          }}
          eventHandlers={{
            click: () => onSelectArbre && onSelectArbre(arbre)
          }}
        >
          <Popup>
            <strong>{arbre.code}</strong>
            <br />
            {arbre.espece} — {LABELS[arbre.statut]}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
