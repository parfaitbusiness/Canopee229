const DB_NAME = 'canopee229'
const STORE = 'file_attente'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Ajoute une action à synchroniser plus tard (ex: nouvelle visite, signalement).
// type: 'visite' | 'signalement'
export async function enqueue(type, payload) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({ type, payload, createdAt: Date.now() })
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueue() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function removeFromQueue(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve(true)
    tx.onerror = () => reject(tx.error)
  })
}

// Tente d'envoyer chaque élément en attente vers Supabase.
// syncFns = { visite: async (payload) => {...}, signalement: async (payload) => {...} }
export async function trySync(syncFns) {
  if (!navigator.onLine) return { synced: 0, remaining: (await getQueue()).length }
  const items = await getQueue()
  let synced = 0
  for (const item of items) {
    try {
      const fn = syncFns[item.type]
      if (fn) {
        await fn(item.payload)
        await removeFromQueue(item.id)
        synced++
      }
    } catch (err) {
      console.warn('Échec de synchronisation, on réessaiera:', err.message)
    }
  }
  const remaining = (await getQueue()).length
  return { synced, remaining }
}
