const KEY = 'qca_collections_v1'

export interface Collection {
  id: string
  name: string
  createdAt: string
  verseRefs: string[]  // e.g. ["2:255", "1:1"]
}

function loadRaw(): Collection[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as Collection[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveAll(list: Collection[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function loadCollections(): Collection[] {
  return loadRaw().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function createCollection(name: string): Collection {
  const col: Collection = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    verseRefs: [],
  }
  saveAll([col, ...loadRaw()])
  return col
}

export function deleteCollection(id: string): void {
  saveAll(loadRaw().filter((c) => c.id !== id))
}

export function addVerseToCollection(collectionId: string, verseRef: string): void {
  const list = loadRaw()
  const idx = list.findIndex((c) => c.id === collectionId)
  if (idx === -1) return
  const col = list[idx]!
  if (!col.verseRefs.includes(verseRef)) {
    col.verseRefs = [verseRef, ...col.verseRefs]
    saveAll(list)
  }
}

export function removeVerseFromCollection(collectionId: string, verseRef: string): void {
  const list = loadRaw()
  const idx = list.findIndex((c) => c.id === collectionId)
  if (idx === -1) return
  list[idx]!.verseRefs = list[idx]!.verseRefs.filter((r) => r !== verseRef)
  saveAll(list)
}

export function renameCollection(id: string, name: string): void {
  const list = loadRaw()
  const idx = list.findIndex((c) => c.id === id)
  if (idx === -1) return
  list[idx]!.name = name.trim()
  saveAll(list)
}
