import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { MoodId } from '../lib/moods'
import {
  addReflection,
  deleteReflection,
  loadReflections,
  type ReflectionEntry,
} from '../lib/reflections'
import { recordActivity } from '../lib/habits'

type LocationState = {
  prefilled?: string
  verseRef?: string
  mood?: MoodId
}

export function Reflection() {
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState

  const [text, setText] = useState('')
  const [verseRef, setVerseRef] = useState<string | undefined>(state.verseRef)
  const [mood, setMood] = useState<MoodId | undefined>(state.mood)
  const [items, setItems] = useState<ReflectionEntry[]>(() => loadReflections())

  useEffect(() => {
    recordActivity()
  }, [])

  useEffect(() => {
    if (state.prefilled) setText(state.prefilled)
    if (state.verseRef) setVerseRef(state.verseRef)
    if (state.mood) setMood(state.mood)
    if (location.state) {
      window.history.replaceState({}, document.title)
    }
  }, [state.prefilled, state.verseRef, state.mood, location.state])

  const canSave = text.trim().length > 0

  const onSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    addReflection({ text, verseRef, mood })
    setText('')
    setVerseRef(undefined)
    setMood(undefined)
    setItems(loadReflections())
  }

  const onDelete = (id: string) => {
    deleteReflection(id)
    setItems(loadReflections())
  }

  const empty = useMemo(() => items.length === 0, [items.length])

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">Reflections</h1>
        <p className="page__subtitle">
          A quiet space to notice what the ayah stirred in you. Entries stay in your browser on this
          device.
        </p>
      </div>

      <form className="card reflection-form" onSubmit={onSave}>
        <label className="field-label" htmlFor="reflection-input">
          Today’s reflection
        </label>
        <textarea
          id="reflection-input"
          className="textarea"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What touched your heart? What will you carry forward?"
        />
        <div className="reflection-form__meta">
          {verseRef ? (
            <span className="pill">
              Linked verse <strong>{verseRef}</strong>
            </span>
          ) : null}
          {mood ? (
            <span className="pill pill--muted">
              Mood: <strong>{mood}</strong>
            </span>
          ) : null}
        </div>
        <button type="submit" className="btn btn--primary" disabled={!canSave}>
          Save reflection
        </button>
      </form>

      <section className="card card--soft">
        <h2 className="card__title">Past reflections</h2>
        {empty ? (
          <p className="card__muted">Nothing saved yet—your first note can be short and honest.</p>
        ) : (
          <ul className="reflection-list">
            {items.map((r) => (
              <li key={r.id} className="reflection-list__item">
                <p className="reflection-list__text">{r.text}</p>
                <div className="reflection-list__foot">
                  <time dateTime={r.createdAt}>
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                  {r.verseRef ? <span className="pill pill--small">{r.verseRef}</span> : null}
                  <button
                    type="button"
                    className="text-btn text-btn--danger"
                    onClick={() => onDelete(r.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
