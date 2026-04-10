const ALQURAN = 'https://api.alquran.cloud/v1'
const QURAN_COM = 'https://api.quran.com/api/v4'
const TFSIR_ID = 169 // Ibn Kathir (Abridged), English

export interface AyahBundle {
  verseKey: string
  surahName: string
  surahNumber: number
  numberInSurah: number
  globalAyahNumber: number
  arabic: string
  translation: string
  audioUrl: string | null
  tafsir: string | null
}

interface EditionAyah {
  number: number
  text: string
  audio?: string
  edition: { identifier: string; englishName: string }
  surah: {
    number: number
    englishName: string
    name: string
  }
  numberInSurah: number
}

interface AlquranAyahResponse {
  code: number
  data: EditionAyah[]
}

interface QuranComTafsirResponse {
  tafsir: {
    text: string
    verses?: Record<string, { id: number }>
  }
}

function normalizeRef(ref: string): string {
  return ref.replace(/\s/g, '')
}

export async function fetchAyahBundle(verseRef: string): Promise<AyahBundle> {
  const ref = normalizeRef(verseRef)
  const editions = 'quran-uthmani,en.sahih,ar.alafasy'
  const res = await fetch(`${ALQURAN}/ayah/${ref}/editions/${editions}`)
  if (!res.ok) throw new Error('Could not load verse from Al Quran Cloud.')
  const body = (await res.json()) as AlquranAyahResponse
  if (body.code !== 200 || !body.data?.length) {
    throw new Error('Unexpected response from Quran API.')
  }

  const arabic =
    body.data.find((e) => e.edition.identifier === 'quran-uthmani')?.text ?? ''
  const translation =
    body.data.find((e) => e.edition.identifier === 'en.sahih')?.text ?? ''
  const audioEdition = body.data.find((e) => e.edition.identifier === 'ar.alafasy')
  const audioUrl = audioEdition?.audio ?? null
  const base = body.data[0]!
  const globalAyahNumber = base.number
  const verseKey = `${base.surah.number}:${base.numberInSurah}`

  let tafsir: string | null = null
  try {
    const tfRes = await fetch(`${QURAN_COM}/tafsirs/${TFSIR_ID}/by_ayah/${globalAyahNumber}`)
    if (tfRes.ok) {
      const tf = (await tfRes.json()) as QuranComTafsirResponse
      const text = tf.tafsir?.text?.trim()
      tafsir = text && text.length > 0 ? text : null
    }
  } catch {
    tafsir = null
  }

  return {
    verseKey,
    surahName: base.surah.englishName,
    surahNumber: base.surah.number,
    numberInSurah: base.numberInSurah,
    globalAyahNumber,
    arabic,
    translation,
    audioUrl,
    tafsir,
  }
}
