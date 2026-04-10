import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createCollection,
  deleteCollection,
  loadCollections,
  removeVerseFromCollection,
  renameCollection,
  type Collection,
} from '../lib/collections'
import { recordActivity } from '../lib/habits'
import { useEffect } from 'react'

export function Collections() {
  const [list, setList] = useState<Collection[]>(() => loadCollections())
  const [newName, setNewName] = useState('')
  const [newErr, setNewErr] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { recordActivity() }, [])

  const reload = () => setList(loadCollections())

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) { setNewErr('Collection name cannot be empty.'); return }
    createCollection(trimmed)
    setNewName('')
    setNewErr('')
    reload()
  }

  const handleDelete = (id: string) => {
    deleteCollection(id)
    reload()
  }

  const handleRename = (id: string) => {
    const trimmed = editName.trim()
    if (!trimmed) return
    renameCollection(id, trimmed)
    setEditId(null)
    reload()
  }

  const handleRemoveVerse = (collId: string, ref: string) => {
    removeVerseFromCollection(collId, ref)
    reload()
  }

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">Collections</h1>
        <p className="page__subtitle">
          Group verses from your Daily Guidance into named collections. Add them straight from the
          guidance page.
        </p>
      </div>

      {/* ── Create new ── */}
      <form className="card coll-create-form" onSubmit={handleCreate}>
        <label className="field-label" htmlFor="coll-name">New collection</label>
        <div className="coll-create-row">
          <input
            id="coll-name"
            type="text"
            className={`field-input${newErr ? ' field-input--err' : ''}`}
            placeholder="e.g. Gratitude verses, Morning recitations…"
            value={newName}
            maxLength={60}
            onChange={(e) => { setNewName(e.target.value); setNewErr('') }}
          />
          <button type="submit" className="btn btn--primary">Create</button>
        </div>
        {newErr && <p className="field-err" role="alert">{newErr}</p>}
      </form>

      {/* ── List ── */}
      {list.length === 0 ? (
        <div className="empty-state">
          <p>No collections yet. Create one above, then add verses from the Daily Guidance page.</p>
          <Link to="/guidance" className="btn btn--ghost">Go to Daily Guidance</Link>
        </div>
      ) : (
        <ul className="coll-list">
          {list.map((col) => {
            const isExpanded = expanded === col.id
            const isEditing = editId === col.id
            return (
              <li key={col.id} className="coll-item card">
                <div className="coll-item__head">
                  {isEditing ? (
                    <div className="coll-edit-row">
                      <input
                        className="field-input"
                        value={editName}
                        maxLength={60}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(col.id)
                          if (e.key === 'Escape') setEditId(null)
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn--primary btn--small"
                        onClick={() => handleRename(col.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="coll-item__name"
                        onClick={() => setExpanded(isExpanded ? null : col.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className="coll-item__icon" aria-hidden>{isExpanded ? '▾' : '▸'}</span>
                        {col.name}
                        <span className="coll-item__count">{col.verseRefs.length} verse{col.verseRefs.length !== 1 ? 's' : ''}</span>
                      </button>
                      <div className="coll-item__actions">
                        <button
                          type="button"
                          className="text-btn"
                          onClick={() => { setEditId(col.id); setEditName(col.name) }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="text-btn text-btn--danger"
                          onClick={() => handleDelete(col.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {isExpanded && (
                  <div className="coll-item__body">
                    {col.verseRefs.length === 0 ? (
                      <p className="card__muted">
                        No verses yet. Open a verse in Daily Guidance and save it here.
                      </p>
                    ) : (
                      <ul className="verse-ref-list">
                        {col.verseRefs.map((ref) => (
                          <li key={ref} className="verse-ref-item">
                            <Link
                              to={`/guidance?ref=${encodeURIComponent(ref)}`}
                              className="verse-ref-item__ref"
                            >
                              {ref}
                            </Link>
                            <button
                              type="button"
                              className="text-btn text-btn--danger"
                              onClick={() => handleRemoveVerse(col.id, ref)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="card__fine">
                      Created{' '}
                      {new Date(col.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
