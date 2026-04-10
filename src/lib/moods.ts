export type MoodId = 'stress' | 'motivation' | 'discipline' | 'gratitude'

export interface VerseContext {
  ref: string
  dailyLife: string
  takeaway: string
}

export const MOOD_LABELS: Record<MoodId, { title: string; blurb: string }> = {
  stress: {
    title: 'Ease & relief',
    blurb: 'When the heart feels heavy, the Qur’an reminds us of Allah’s mercy and our human limits.',
  },
  motivation: {
    title: 'Courage to move',
    blurb: 'Verses that affirm effort, trust, and hope after hardship.',
  },
  discipline: {
    title: 'Steady practice',
    blurb: 'Time, truth, and intention—building a life aligned with purpose.',
  },
  gratitude: {
    title: 'Thankful presence',
    blurb: 'Recognizing blessings and returning to a posture of praise.',
  },
}

export const MOOD_LIBRARY: Record<MoodId, VerseContext[]> = {
  stress: [
    {
      ref: '2:286',
      dailyLife:
        'Allah does not ask you to carry more than you can bear. In daily life, this means releasing perfectionism, asking for help, and speaking to Him honestly when you feel overwhelmed—mistakes and forgetfulness included.',
      takeaway:
        'Name one burden you will hand over in du‘ā today, and one small kind boundary you will keep for your wellbeing.',
    },
    {
      ref: '94:5',
      dailyLife:
        'Ease follows difficulty—often not on your schedule, but as part of how Allah nurtures growth. Practically, this invites patience with slow progress and trust during tight moments.',
      takeaway:
        'After your next hard hour, pause for two minutes of dhikr or silence before deciding the day “failed.”',
    },
    {
      ref: '89:27',
      dailyLife:
        'The peaceful soul is the one that returns to its Lord pleased and pleasing. Daily life becomes lighter when you realign small choices with what truly pleases Him.',
      takeaway:
        'Tonight, note one good deed you did only for His sake—even if it was small—and end with “Alhamdulillah.”',
    },
  ],
  motivation: [
    {
      ref: '53:39',
      dailyLife:
        'Nothing valuable comes except by effort paired with faith. In work, study, or family life, show up consistently; outcomes belong to Allah.',
      takeaway:
        'Pick one goal for this week and schedule two concrete blocks of focused work—then begin with bismillāh.',
    },
    {
      ref: '65:7',
      dailyLife:
        'You are not measured against someone else’s capacity. Motivation grows when you compare yourself to yesterday’s self, not to another person’s highlight reel.',
      takeaway:
        'Rewrite one expectation you hold that is clearly above your current bandwidth into a smaller, doable step.',
    },
    {
      ref: '41:30',
      dailyLife:
        'Angels draw near to those who remember Allah—your heart is not alone in the striving. Let that awareness soften anxiety when you take the next right step.',
      takeaway:
        'Set three short adhkār anchors today (after salah, before sleep, or on your commute) and keep them.',
    },
  ],
  discipline: [
    {
      ref: '103:1',
      dailyLife:
        'Time is witness: without faith and good deeds and truth, days slip away. Discipline is loving structure—prayer, honesty, and mutual counsel—that keeps life from drifting.',
      takeaway:
        'Choose one daily habit (even five minutes of Qur’an or a walk with du‘ā) and protect it like a fixed appointment.',
    },
    {
      ref: '51:56',
      dailyLife:
        'We were created to worship—not only ritual, but mindful living. Discipline is remembering Him in ordinary moments so they become acts of devotion.',
      takeaway:
        'Before your next meal or meeting, pause with one conscious “SubhānAllāh” to recentre intention.',
    },
    {
      ref: '3:200',
      dailyLife:
        'Patience, prayer, and presence with Allah steady the believer when tests arrive. In daily life, that looks like fewer reactive decisions and more grounded responses.',
      takeaway:
        'When tension rises today, take three slow breaths and make one short du‘ā before you reply.',
    },
  ],
  gratitude: [
    {
      ref: '14:7',
      dailyLife:
        'Gratitude increases blessing in experience: naming what is good trains the heart to see more of it, even in ordinary days.',
      takeaway:
        'Write three specific gratitudes before bed—include one you usually overlook.',
    },
    {
      ref: '55:13',
      dailyLife:
        'The repeating refrain “So which of the favors of your Lord will you deny?” invites wonder at what already surrounds you—health, shelter, relationships, breath.',
      takeaway:
        'Step outside or to a window for one minute; notice one sign of Allah’s creative care and say “Alhamdulillah.”',
    },
    {
      ref: '93:11',
      dailyLife:
        'After every constriction, Allah promises ease. Gratitude here includes trusting that unseen mercy is already on its way.',
      takeaway:
        'Pair one worry you carry with one past difficulty Allah already eased for you—and thank Him for both.',
    },
  ],
}

function stableIndex(seed: string, modulo: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h) % modulo
}

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function pickVerseForDay(mood: MoodId, dateKey = localDateKey()): VerseContext {
  const list = MOOD_LIBRARY[mood]
  const i = stableIndex(`${mood}:${dateKey}`, list.length)
  return list[i]!
}
