const PROFILE_KEY = 'qca_profile_v1'

export interface UserProfile {
  id: string
  displayName: string
  avatarColor: string
  joinedAt: string
}

export const AVATAR_COLORS = [
  { value: '#2F5D50', label: 'Forest' },
  { value: '#B8952C', label: 'Gold' },
  { value: '#7A5C8A', label: 'Mauve' },
  { value: '#3D5A80', label: 'Navy' },
  { value: '#B56B4A', label: 'Terra' },
  { value: '#4A6670', label: 'Slate' },
] as const

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as UserProfile
    if (!p.id || !p.displayName) return null
    return p
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function createProfile(displayName: string, avatarColor: string): UserProfile {
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    displayName: displayName.trim(),
    avatarColor,
    joinedAt: new Date().toISOString(),
  }
  saveProfile(profile)
  return profile
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY)
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
