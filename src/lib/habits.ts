const STORAGE_KEY = 'qca_habit_v1'

export interface HabitState {
  lastActiveDate: string | null
  streak: number
  totalActiveDays: number
}

function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

function dayDiff(a: Date, b: Date): number {
  const ms = 86400000
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((ub - ua) / ms)
}

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadRaw(): HabitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { lastActiveDate: null, streak: 0, totalActiveDays: 0 }
    }
    const p = JSON.parse(raw) as HabitState
    return {
      lastActiveDate: p.lastActiveDate ?? null,
      streak: typeof p.streak === 'number' ? p.streak : 0,
      totalActiveDays: typeof p.totalActiveDays === 'number' ? p.totalActiveDays : 0,
    }
  } catch {
    return { lastActiveDate: null, streak: 0, totalActiveDays: 0 }
  }
}

function save(state: HabitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/** Call when user engages with the app (dashboard, guidance, reflections). */
export function recordActivity(): HabitState {
  const today = localDateKey()
  let state = loadRaw()
  if (state.lastActiveDate === today) return state

  if (!state.lastActiveDate) {
    state = {
      lastActiveDate: today,
      streak: 1,
      totalActiveDays: state.totalActiveDays + 1,
    }
    save(state)
    return state
  }

  const last = parseLocalDate(state.lastActiveDate)
  const now = parseLocalDate(today)
  const diff = dayDiff(last, now)
  let streak = state.streak
  if (diff === 1) streak += 1
  else streak = 1

  state = {
    lastActiveDate: today,
    streak,
    totalActiveDays: state.totalActiveDays + 1,
  }
  save(state)
  return state
}

export function readHabitState(): HabitState {
  return loadRaw()
}
