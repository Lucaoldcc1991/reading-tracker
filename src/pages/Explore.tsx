// Explore.tsx
import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'
import { COUNTRIES } from '../utils/countries'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  pages?: number
  readingMonth?: number
  readingYear?: number
  publicationYear?: number
  classic?: boolean
  cover?: string // Aggiunto per supportare la copertina
}

const MONTHS = [
  'Gennaio','Febbraio','Marzo','Aprile',
  'Maggio','Giugno','Luglio','Agosto',
  'Settembre','Ottobre','Novembre','Dicembre'
]

type View = 'home' | 'genres' | 'classics' | 'authorsAll' | 'periods' | 'series' | 'countries' | 'lengths'

type AuthorItem = {
  author: string
  count: number
  surname: string
  name: string
}

// Ordine cronologico fisso per evitare che l'ordine alfabetico sfalsi le epoche
const PERIOD_ORDER = [
  'Pre-1700 · Imperi · Medioevo · Gotico',
  '1700–1849 · Illuminismo · Rivoluzioni · Romanticismo',
  '1850–1900 · Vittoriano · Neogotico · Realismo',
  '1900–1945 · Modernità · Avanguardie · Guerre',
  '1946–1979 · Guerra Fredda · Esistenzialismo · Postmoderno',
  '1980–1999 · Globalizzazione · Contemporaneo',
  '2000+ · Contemporaneo',
  'Sconosciuto'
]

// Ordine fisso per le categorie di lunghezza, dal più corto al più lungo
const LENGTH_ORDER = [
  '📘 Brevi',
  '📗 Medi',
  '📙 Lunghi',
  '📕 Mattoni',
  '🧱 Colossi',
  'Sconosciuto'
]

// Range di pagine mostrato in modo discreto accanto a ogni categoria
const LENGTH_RANGES: Record<string, string> = {
  '📘 Brevi': 'fino a 199 pagine',
  '📗 Medi': '200–399 pagine',
  '📙 Lunghi': '400–599 pagine',
  '📕 Mattoni': '600–899 pagine',
  '🧱 Colossi': '900+ pagine',
  'Sconosciuto': ''
}

/* ================= PALETTE "SCAFFALE" =================
   Stessa identità visiva di Home e Libreria. */
const INK = '#2B2118'
const PAPER = '#FBF7F1'
const PAPER_MUTED = '#F3EDE3'

type Accent = { from: string; to: string; soft: string }

const TEAL: Accent     = { from: '#1B4B43', to: '#0F332D', soft: '#E4EFEC' }
const BURGUNDY: Accent = { from: '#7C2D42', to: '#54202F', soft: '#F3E5E7' }
const GOLD: Accent     = { from: '#C08A28', to: '#8F661C', soft: '#F6EEDD' }
const PLUM: Accent     = { from: '#4A3B6B', to: '#332748', soft: '#EBE7F1' }
const SAGE: Accent     = { from: '#8FAE7D', to: '#66815A', soft: '#EAF1E5' }
const SKY: Accent      = { from: '#2E9CE0', to: '#1D6FA8', soft: '#DDEFFB' }
const CLAY: Accent     = { from: '#A15C38', to: '#703E25', soft: '#F1E1D5' }

/* ================= COLORE PER GENERE =================
   Stessa mappa usata nella Libreria: ogni famiglia di generi
   ha un colore fisso, così Esplora resta coerente col resto dell'app. */
const GENRE_COLOR_MAP: { match: string[]; color: Accent }[] = [
  { match: ['giallo', 'noir', 'legal'], color: { from: '#D4AC0D', to: '#A17E09', soft: '#FBF1CC' } },
  { match: ['thriller'], color: { from: '#1D4ED8', to: '#173F9E', soft: '#DCE6FB' } },
  { match: ['horror', 'gotic', 'paranormal'], color: { from: '#6D28D9', to: '#4C1D95', soft: '#E9E1FB' } },
  { match: ['realis', 'psicolog', 'filosof'], color: { from: '#B91C1C', to: '#7F1414', soft: '#FBE0E0' } },
  { match: ['ragazz'], color: SKY },
  { match: ['saggi'], color: { from: '#2EE86B', to: '#159244', soft: '#E1FAEA' } },
  { match: ['fumett', 'graphic', 'manga'], color: { from: '#7DD3FC', to: '#38A9DE', soft: '#EAF7FE' } },
  { match: ['storic', 'formazione', 'autobiograf'], color: { from: '#8B5E34', to: '#5E3D1F', soft: '#F1E6D8' } },
  { match: ['fantascienza', 'sci-fi', 'sci fi'], color: { from: '#14B8A6', to: '#0D7A6F', soft: '#DBF5F2' } },
  { match: ['fantasy'], color: { from: '#FF8A00', to: '#C96500', soft: '#FFEBD1' } },
  { match: ['avventura'], color: SAGE },
  { match: ['distopi'], color: { from: '#1F2328', to: '#000000', soft: '#E7E7E7' } }
]

const GENRE_FALLBACK: Accent = { from: '#8A7B68', to: '#5C4E3D', soft: PAPER_MUTED }

const genreColorFor = (genre?: string): Accent => {
  if (!genre) return GENRE_FALLBACK
  const g = genre.toLowerCase()
  const found = GENRE_COLOR_MAP.find(entry => entry.match.some(k => g.includes(k)))
  return found ? found.color : GENRE_FALLBACK
}

/* ================= MAPPA PAESE → CONTINENTE =================
   ⚠️ ASSUNZIONE: non conosco la struttura esatta di COUNTRIES,
   quindi ho costruito questa tabella con i nomi paese più comuni
   in italiano. Se un tuo paese non compare qui, i suoi libri non
   finiranno nel grafico (ma verranno segnalati come "non mappati"
   sotto al grafico) — mandami la lista e la completo. */
const CONTINENT_MAP: Record<string, string> = {
  // Europa
  'Italia': 'Europa', 'Francia': 'Europa', 'Germania': 'Europa', 'Spagna': 'Europa',
  'Regno Unito': 'Europa', 'Portogallo': 'Europa', 'Irlanda': 'Europa',
  'Paesi Bassi': 'Europa', 'Olanda': 'Europa', 'Belgio': 'Europa', 'Svizzera': 'Europa',
  'Austria': 'Europa', 'Polonia': 'Europa', 'Repubblica Ceca': 'Europa', 'Ungheria': 'Europa',
  'Romania': 'Europa', 'Bulgaria': 'Europa', 'Grecia': 'Europa', 'Svezia': 'Europa',
  'Norvegia': 'Europa', 'Danimarca': 'Europa', 'Finlandia': 'Europa', 'Islanda': 'Europa',
  'Russia': 'Europa', 'Ucraina': 'Europa', 'Croazia': 'Europa', 'Serbia': 'Europa',
  'Slovenia': 'Europa', 'Slovacchia': 'Europa', 'Lituania': 'Europa', 'Lettonia': 'Europa',
  'Estonia': 'Europa', 'Albania': 'Europa', 'Bosnia ed Erzegovina': 'Europa',
  'Macedonia del Nord': 'Europa', 'Montenegro': 'Europa', 'Malta': 'Europa',
  'Cipro': 'Europa', 'Lussemburgo': 'Europa', 'Monaco': 'Europa', 'Bielorussia': 'Europa',
  'Moldavia': 'Europa',

  // America
  'Stati Uniti': 'America', 'Canada': 'America', 'Messico': 'America', 'Brasile': 'America',
  'Argentina': 'America', 'Cile': 'America', 'Colombia': 'America', 'Perù': 'America',
  'Venezuela': 'America', 'Ecuador': 'America', 'Bolivia': 'America', 'Paraguay': 'America',
  'Uruguay': 'America', 'Cuba': 'America', 'Repubblica Dominicana': 'America', 'Haiti': 'America',
  'Guatemala': 'America', 'Honduras': 'America', 'El Salvador': 'America', 'Nicaragua': 'America',
  'Costa Rica': 'America', 'Panama': 'America', 'Giamaica': 'America', 'Porto Rico': 'America',

  // Asia
  'Cina': 'Asia', 'Giappone': 'Asia', 'Corea del Sud': 'Asia', 'Corea del Nord': 'Asia',
  'India': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia', 'Vietnam': 'Asia',
  'Thailandia': 'Asia', 'Indonesia': 'Asia', 'Filippine': 'Asia', 'Malesia': 'Asia',
  'Singapore': 'Asia', 'Myanmar': 'Asia', 'Cambogia': 'Asia', 'Laos': 'Asia',
  'Mongolia': 'Asia', 'Kazakistan': 'Asia', 'Uzbekistan': 'Asia', 'Nepal': 'Asia',
  'Sri Lanka': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Israele': 'Asia',
  'Arabia Saudita': 'Asia', 'Emirati Arabi Uniti': 'Asia', 'Turchia': 'Asia',
  'Giordania': 'Asia', 'Libano': 'Asia', 'Siria': 'Asia', 'Yemen': 'Asia',
  'Afghanistan': 'Asia', 'Taiwan': 'Asia', 'Hong Kong': 'Asia',

  // Africa
  'Egitto': 'Africa', 'Sudafrica': 'Africa', 'Nigeria': 'Africa', 'Kenya': 'Africa',
  'Marocco': 'Africa', 'Algeria': 'Africa', 'Tunisia': 'Africa', 'Libia': 'Africa',
  'Etiopia': 'Africa', 'Ghana': 'Africa', 'Senegal': 'Africa', "Costa d'Avorio": 'Africa',
  'Camerun': 'Africa', 'Tanzania': 'Africa', 'Uganda': 'Africa', 'Zimbabwe': 'Africa',
  'Mozambico': 'Africa', 'Angola': 'Africa', 'Congo': 'Africa',
  'Repubblica Democratica del Congo': 'Africa', 'Zambia': 'Africa', 'Namibia': 'Africa',
  'Botswana': 'Africa', 'Ruanda': 'Africa', 'Somalia': 'Africa', 'Mali': 'Africa',
  'Niger': 'Africa', 'Ciad': 'Africa', 'Sudan': 'Africa',

  // Oceania
  'Australia': 'Oceania', 'Nuova Zelanda': 'Oceania', 'Papua Nuova Guinea': 'Oceania',
  'Figi': 'Oceania', 'Samoa': 'Oceania', 'Tonga': 'Oceania'
}

// Colore fisso per categoria di lunghezza, dal più "leggero" (Brevi)
// al più "pesante" (Colossi) — stessa logica cromatica del resto dell'app.
const LENGTH_COLORS: Record<string, Accent> = {
  '📘 Brevi': SKY,
  '📗 Medi': SAGE,
  '📙 Lunghi': GOLD,
  '📕 Mattoni': CLAY,
  '🧱 Colossi': BURGUNDY,
  'Sconosciuto': { from: '#8A7B68', to: '#5C4E3D', soft: PAPER_MUTED }
}

const lengthColorFor = (category: string): Accent =>
  LENGTH_COLORS[category] || LENGTH_COLORS['Sconosciuto']

const CONTINENT_ORDER = ['Europa', 'Asia', 'Africa', 'America', 'Oceania']

const CONTINENT_ACCENTS: Record<string, Accent> = {
  Europa: SKY,
  Asia: GOLD,
  Africa: CLAY,
  America: SAGE,
  Oceania: PLUM
}

const HOME_CARDS: { view: View; icon: string; title: string; desc: string; accent: Accent }[] = [
  { view: 'authorsAll', icon: '👤', title: 'Autori', desc: 'Esplora gli autori', accent: TEAL },
  { view: 'genres', icon: '📚', title: 'Generi', desc: 'Esplora i libri per categoria', accent: BURGUNDY },
  { view: 'classics', icon: '🏛️', title: 'Classici', desc: 'Autori e opere classiche', accent: GOLD },
  { view: 'periods', icon: '⏳', title: 'Periodi storici', desc: 'Esplora per epoca', accent: PLUM },
  { view: 'series', icon: '📖', title: 'Serie', desc: 'Esplora i libri per saga', accent: SAGE },
  { view: 'countries', icon: '🌍', title: 'Paesi', desc: 'Esplora i libri per provenienza', accent: SKY },
  { view: 'lengths', icon: '📏', title: 'Lunghezza', desc: 'Esplora i libri per numero di pagine', accent: CLAY }
]

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([])
  const [view, setView] = useState<View>('home')

  const [globalAuthor, setGlobalAuthor] = useState<string | null>(null)
  const [searchAuthor, setSearchAuthor] = useState('')
  const [letterFilter, setLetterFilter] = useState<string | null>(null)

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedLength, setSelectedLength] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  /* 🏛️ FILTRO CLASSICI */
  const classicBooks = useMemo(() => {
    return books.filter(b => b.classic === true)
  }, [books])

  /* 📚 RAGGRUPPAMENTO GENERI */
  const genresList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      if (!b.genre) return
      if (!map[b.genre]) map[b.genre] = []
      map[b.genre].push(b)
    })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [books])

  const booksByGenre = useMemo(() => {
    if (!selectedGenre) return []
    return books.filter(b => b.genre === selectedGenre)
  }, [books, selectedGenre])

  /* 📖 RAGGRUPPAMENTO SERIE */
  const seriesList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      if (!b.series) return
      if (!map[b.series]) map[b.series] = []
      map[b.series].push(b)
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [books])

  const booksBySeries = useMemo(() => {
    if (!selectedSeries) return []
    return books.filter(b => b.series === selectedSeries)
  }, [books, selectedSeries])

  /* 🌍 RAGGRUPPAMENTO PAESI */
  const countriesList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      const country = b.country || 'Sconosciuto'
      if (!map[country]) map[country] = []
      map[country].push(b)
    })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [books])

  const booksByCountry = useMemo(() => {
    if (!selectedCountry) return []
    return books.filter(
      b => (b.country || 'Sconosciuto') === selectedCountry
    )
  }, [books, selectedCountry])

  /* 🥧 CONTEGGIO PER CONTINENTE */
  const continentCounts = useMemo(() => {
    const map: Record<string, number> = {}
    books.forEach(b => {
      if (!b.country) return
      const continent = CONTINENT_MAP[b.country]
      if (!continent) return
      map[continent] = (map[continent] || 0) + 1
    })
    return map
  }, [books])

  const unmappedCount = useMemo(() => {
    return books.filter(b => b.country && !CONTINENT_MAP[b.country]).length
  }, [books])

  /* ⏳ PERIODI STORICI AGGIORNATI */
  const getPeriod = (year?: number) => {
    if (!year) return 'Sconosciuto'
    if (year < 1700) return 'Pre-1700 · Imperi · Medioevo · Gotico'
    if (year <= 1849) return '1700–1849 · Illuminismo · Rivoluzioni · Romanticismo'
    if (year <= 1900) return '1850–1900 · Vittoriano · Neogotico · Realismo'
    if (year <= 1945) return '1900–1945 · Modernità · Avanguardie · Guerre'
    if (year <= 1979) return '1946–1979 · Guerra Fredda · Esistenzialismo · Postmoderno'
    if (year <= 1999) return '1980–1999 · Globalizzazione · Contemporaneo'
    return '2000+ · Contemporaneo'
  }

  const periods = useMemo(() => {
    const map: Record<string, Book[]> = {}

    books.forEach(b => {
      const period = getPeriod(b.publicationYear ?? b.readingYear)
      if (!map[period]) map[period] = []
      map[period].push(b)
    })

    // Ordinamento cronologico basato su PERIOD_ORDER anziché alfabetico
    return Object.entries(map).sort(([a], [b]) => {
      const indexA = PERIOD_ORDER.indexOf(a)
      const indexB = PERIOD_ORDER.indexOf(b)
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
    })
  }, [books])

  const booksByPeriod = useMemo(() => {
    if (!selectedPeriod) return []
    return books.filter(
      b => getPeriod(b.publicationYear ?? b.readingYear) === selectedPeriod
    )
  }, [books, selectedPeriod])

  /* 📏 RAGGRUPPAMENTO PER LUNGHEZZA */
  const getLengthCategory = (pages?: number) => {
    if (!pages) return 'Sconosciuto'
    if (pages <= 199) return '📘 Brevi'
    if (pages <= 399) return '📗 Medi'
    if (pages <= 599) return '📙 Lunghi'
    if (pages <= 899) return '📕 Mattoni'
    return '🧱 Colossi'
  }

  const lengthsList = useMemo(() => {
    const map: Record<string, Book[]> = {}

    books.forEach(b => {
      const category = getLengthCategory(b.pages)
      if (!map[category]) map[category] = []
      map[category].push(b)
    })

    return Object.entries(map).sort(([a], [b]) => {
      const indexA = LENGTH_ORDER.indexOf(a)
      const indexB = LENGTH_ORDER.indexOf(b)
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
    })
  }, [books])

  const booksByLength = useMemo(() => {
    if (!selectedLength) return []
    return books.filter(b => getLengthCategory(b.pages) === selectedLength)
  }, [books, selectedLength])

  const totalBooks = books.length

  const totalAuthors = useMemo(() => {
    return new Set(books.map(b => b.author)).size
  }, [books])

  const allAuthors: AuthorItem[] = useMemo(() => {
    const map: Record<string, number> = {}

    books.forEach(b => {
      map[b.author] = (map[b.author] || 0) + 1
    })

    return Object.entries(map)
      .map(([author, count]) => {
        const parts = author.trim().split(' ')
        const surname = parts.length > 1 ? parts[parts.length - 1] : author
        const name = parts.slice(0, -1).join(' ')
        return { author, count, surname, name }
      })
      .sort((a, b) => a.surname.localeCompare(b.surname))
  }, [books])

  const filteredAuthors = useMemo(() => {
    return allAuthors.filter(a => {
      const matchSearch =
        a.author.toLowerCase().includes(searchAuthor.toLowerCase())

      const matchLetter =
        !letterFilter || a.surname.toUpperCase().startsWith(letterFilter)

      return matchSearch && matchLetter
    })
  }, [allAuthors, searchAuthor, letterFilter])

  const groupedAuthors = useMemo(() => {
    const groups: Record<string, AuthorItem[]> = {}

    filteredAuthors.forEach(a => {
      const letter = a.surname.charAt(0).toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(a)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredAuthors])

  const booksByGlobalAuthor = useMemo(() => {
    if (!globalAuthor) return []
    return books.filter(b => b.author === globalAuthor)
  }, [books, globalAuthor])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const goBack = () => {
    if (view === 'authorsAll') {
      if (globalAuthor) {
        setGlobalAuthor(null)
      } else {
        setView('home')
        setLetterFilter(null)
        setSearchAuthor('')
      }
    } else if (view === 'periods') {
      if (selectedPeriod) {
        setSelectedPeriod(null)
      } else {
        setView('home')
      }
    } else if (view === 'genres') {
      if (selectedGenre) {
        setSelectedGenre(null)
      } else {
        setView('home')
      }
    } else if (view === 'series') {
      if (selectedSeries) {
        setSelectedSeries(null)
      } else {
        setView('home')
      }
    } else if (view === 'countries') {
      if (selectedCountry) {
        setSelectedCountry(null)
      } else {
        setView('home')
      }
    } else if (view === 'lengths') {
      if (selectedLength) {
        setSelectedLength(null)
      } else {
        setView('home')
      }
    } else {
      setView('home')
    }
  }

  // Renderizzatore universale e pulito per TUTTE le schede (Generi, Classici, Periodi, Autori, Serie, Paesi, Lunghezza)
  // Ogni libro prende il colore del proprio genere tramite un pallino discreto in alto a destra,
  // coerente con lo stile di Libreria (niente più bordi spessi colorati).
  // Ordine sempre cronologico di lettura: il primo letto in cima, il più recente in fondo.
  const renderCleanBookList = (list: Book[]) => {
    const sortedList = [...list].sort((a, b) => {
      const aKey = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bKey = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
      return aKey - bKey
    })

    return (
      <div>
        <div style={styles.metaLine}>📖 {sortedList.length} libri</div>

        {sortedList.map(b => {
          const month = b.readingMonth ? MONTHS[b.readingMonth - 1] : ''
          const accent = genreColorFor(b.genre)

          return (
            <div key={b.id} style={styles.bookCard}>
              <span
                style={{
                  ...styles.genreDot,
                  background: accent.from,
                  boxShadow: `0 0 0 3px ${accent.soft}`
                }}
                title={b.genre}
              />

              {b.cover ? (
                <img src={b.cover} alt={b.title} style={styles.cover} />
              ) : (
                <div style={{ ...styles.coverPlaceholder, background: accent.soft, color: accent.from }}>📕</div>
              )}

              <div style={styles.info}>
                <div style={styles.bookTitle}>{b.title}</div>
                <div style={{ fontSize: 12, color: '#6b6152', marginTop: 2 }}>
                  {b.author}
                </div>
                {!!b.pages && (
                  <div style={styles.pagesMeta}>
                    {b.pages} pagine
                  </div>
                )}
                {month && b.readingYear && (
                  <div style={styles.readingMeta}>
                    📅 {month} {b.readingYear}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧭 Esplora</h2>

      {view !== 'home' && (
        <button style={styles.back} onClick={goBack}>
          ← Indietro
        </button>
      )}

      {view === 'home' && (
        <div style={styles.homeGrid}>
          {HOME_CARDS.map(card => (
            <div
              key={card.view}
              style={{
                ...styles.card3d,
                background: `linear-gradient(155deg, ${card.accent.from}, ${card.accent.to})`
              }}
              onClick={() => setView(card.view)}
            >
              <div style={styles.cardIcon}>{card.icon}</div>
              <div style={styles.cardTitle}>{card.title}</div>
              <div style={styles.cardDesc}>{card.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* 📚 SEZIONE GENERI */}
      {view === 'genres' && !selectedGenre && (
        <div style={styles.stack}>
          {genresList.length > 0 && (
            <div style={styles.mapCard}>
              <h3 style={styles.mapTitle}>📊 Libri per genere</h3>
              <GenreDonut list={genresList} />
            </div>
          )}

          {genresList.map(([genre, list]) => {
            const accent = genreColorFor(genre)
            return (
              <div
                key={genre}
                style={styles.rowCard}
                onClick={() => setSelectedGenre(genre)}
              >
                <span style={styles.rowTitleWithDot}>
                  <span
                    style={{
                      ...styles.genreDotInline,
                      background: accent.from,
                      boxShadow: `0 0 0 3px ${accent.soft}`
                    }}
                  />
                  {genre}
                </span>
                <span style={styles.pill}>{list.length}</span>
              </div>
            )
          })}
        </div>
      )}

      {view === 'genres' && selectedGenre && 
        renderCleanBookList(booksByGenre)
      }

      {/* 🏛️ SEZIONE CLASSICI */}
      {view === 'classics' && 
        renderCleanBookList(classicBooks)
      }

      {/* ⏳ SEZIONE PERIODI STORICI */}
      {view === 'periods' && !selectedPeriod && (
        <div style={styles.stack}>
          {periods.map(([period, list]) => {
            const [years, ...descParts] = period.split(' · ')
            const desc = descParts.join(' · ')

            return (
              <div
                key={period}
                style={styles.rowCard}
                onClick={() => setSelectedPeriod(period)}
              >
                <span style={styles.periodLabel}>
                  <span style={styles.periodYears}>{years}</span>
                  {desc && <span style={styles.periodDesc}> · {desc}</span>}
                </span>
                <span style={styles.pill}>{list.length}</span>
              </div>
            )
          })}
        </div>
      )}

      {view === 'periods' && selectedPeriod && 
        renderCleanBookList(booksByPeriod)
      }

      {/* 📖 SEZIONE SERIE */}
      {view === 'series' && !selectedSeries && (
        <div style={styles.stack}>
          {seriesList.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📖</p>
              <p style={styles.emptyText}>Nessuna serie registrata.</p>
            </div>
          )}
          {seriesList.map(([series, list]) => (
            <div
              key={series}
              style={styles.rowCard}
              onClick={() => setSelectedSeries(series)}
            >
              <span style={styles.rowTitle}>{series}</span>
              <span style={styles.pill}>{list.length}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'series' && selectedSeries &&
        renderCleanBookList(booksBySeries)
      }

      {/* 🌍 SEZIONE PAESI */}
      {view === 'countries' && !selectedCountry && (
        <div style={styles.stack}>
          <div style={styles.mapCard}>
            <h3 style={styles.mapTitle}>📊 Libri per continente</h3>
            <ContinentDonut counts={continentCounts} />
            {unmappedCount > 0 && (
              <p style={styles.mapNote}>
                +{unmappedCount} libr{unmappedCount === 1 ? 'o' : 'i'} da paesi non ancora mappati
              </p>
            )}
          </div>

          {countriesList.map(([country, list]) => {
            const flag = COUNTRIES.find(c => c.name === country)?.flag
            return (
              <div
                key={country}
                style={styles.rowCard}
                onClick={() => setSelectedCountry(country)}
              >
                <span style={styles.rowTitle}>{flag ? `${flag} ` : ''}{country}</span>
                <span style={styles.pill}>{list.length}</span>
              </div>
            )
          })}
        </div>
      )}

      {view === 'countries' && selectedCountry &&
        renderCleanBookList(booksByCountry)
      }

      {/* 📏 SEZIONE LUNGHEZZA */}
      {view === 'lengths' && !selectedLength && (
        <div style={styles.stack}>
          {lengthsList.length > 0 && (
            <div style={styles.mapCard}>
              <h3 style={styles.mapTitle}>📊 Libri per lunghezza</h3>
              <LengthDonut list={lengthsList} />
            </div>
          )}

          {lengthsList.map(([category, list]) => (
            <div
              key={category}
              style={styles.rowCard}
              onClick={() => setSelectedLength(category)}
            >
              <span style={styles.periodLabel}>
                <span style={styles.periodYears}>{category}</span>
                {LENGTH_RANGES[category] && (
                  <span style={styles.periodDesc}> · {LENGTH_RANGES[category]}</span>
                )}
              </span>
              <span style={styles.pill}>{list.length}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'lengths' && selectedLength &&
        renderCleanBookList(booksByLength)
      }

      {/* 👤 SEZIONE AUTORI */}
      {view === 'authorsAll' && !globalAuthor && (
        <>
          <div style={styles.statsCard}>
            <div style={styles.statsBlock}>
              <div style={styles.statsIcon}>📚</div>
              <div>
                <div style={styles.statsNumber}>{totalBooks}</div>
                <div style={styles.statsLabel}>Libri</div>
              </div>
            </div>

            <div style={styles.statsDivider} />

            <div style={styles.statsBlock}>
              <div style={styles.statsIcon}>✍️</div>
              <div>
                <div style={styles.statsNumber}>{totalAuthors}</div>
                <div style={styles.statsLabel}>Autori</div>
              </div>
            </div>
          </div>

          <input
            placeholder="Cerca autore..."
            value={searchAuthor}
            onChange={e => setSearchAuthor(e.target.value)}
            style={styles.search}
          />

          <div style={styles.alphabet}>
            {alphabet.map(l => (
              <button
                key={l}
                onClick={() =>
                  setLetterFilter(prev => (prev === l ? null : l))
                }
                style={{
                  ...styles.letter,
                  background: letterFilter === l ? TEAL.from : '#fff',
                  color: letterFilter === l ? '#fff' : INK,
                  borderColor: letterFilter === l ? TEAL.from : PAPER_MUTED
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {(searchAuthor || letterFilter) && (
            <button
              onClick={() => {
                setSearchAuthor('')
                setLetterFilter(null)
              }}
              style={styles.resetLetters}
            >
              Tutti
            </button>
          )}

          <div style={styles.stack}>
            {groupedAuthors.map(([letter, authors]) => (
              <div key={letter}>
                <div style={styles.letterHeader}>{letter}</div>

                {authors.map(a => (
                  <div
                    key={a.author}
                    style={styles.rowCard}
                    onClick={() => setGlobalAuthor(a.author)}
                  >
                    <span style={styles.rowTitle}>
                      {a.surname}, {a.name}
                    </span>
                    <span style={styles.pill}>{a.count}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'authorsAll' && globalAuthor &&
        renderCleanBookList(booksByGlobalAuthor)
      }
    </div>
  )
}

/* ================= GRAFICO A CIAMBELLA PER CONTINENTE =================
   Sostituisce la vecchia cartina geografica: stessa funzione (mostrare
   la distribuzione dei libri tra i continenti) ma resa con un grafico
   a ciambella + legenda. Visivamente è volutamente molto diverso
   dall'elenco dei paesi qui sotto (righe bianche con bandierina):
   qui c'è un cerchio colorato con il totale al centro e una legenda
   compatta senza card, per non confondere le due sezioni. */
function ContinentDonut({ counts }: { counts: Record<string, number> }) {
  const NEUTRAL_STROKE = '#DCD5C4'
  const NEUTRAL_TEXT = '#B7AC9A'

  const entries = CONTINENT_ORDER.map(name => ({
    name,
    count: counts[name] || 0,
    accent: CONTINENT_ACCENTS[name]
  }))

  const total = entries.reduce((sum, e) => sum + e.count, 0)

  const r = 62
  const strokeWidth = 22
  const circumference = 2 * Math.PI * r

  let cumulative = 0

  return (
    <div style={styles.donutWrap}>
      <svg viewBox="0 0 180 180" style={styles.donutSvg}>
        {/* Anello di base, sempre visibile */}
        <circle
          cx={90} cy={90} r={r}
          fill="none"
          stroke={NEUTRAL_STROKE}
          strokeWidth={strokeWidth}
        />

        {/* Uno spicchio per ogni continente con almeno un libro */}
        {total > 0 && entries.filter(e => e.count > 0).map(e => {
          const arcLength = (e.count / total) * circumference
          const offset = -(cumulative / total) * circumference
          cumulative += e.count

          return (
            <circle
              key={e.name}
              cx={90} cy={90} r={r}
              fill="none"
              stroke={e.accent.from}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
            />
          )
        })}

        <text x={90} y={84} textAnchor="middle" style={{ fontSize: 28, fontWeight: 800, fill: INK }}>
          {total}
        </text>
        <text x={90} y={104} textAnchor="middle" style={{ fontSize: 9.5, fontWeight: 700, fill: '#8A7B68', letterSpacing: 0.5 }}>
          LIBRI MAPPATI
        </text>
      </svg>

      <div style={styles.donutLegend}>
        {entries.map(e => {
          const pct = total > 0 ? Math.round((e.count / total) * 100) : 0
          const active = e.count > 0

          return (
            <div key={e.name} style={styles.donutLegendRow}>
              <span
                style={{
                  ...styles.donutLegendDot,
                  background: active ? e.accent.from : NEUTRAL_STROKE
                }}
              />
              <span style={{ ...styles.donutLegendName, color: active ? INK : NEUTRAL_TEXT }}>
                {e.name}
              </span>
              <span style={{ ...styles.donutLegendCount, color: active ? e.accent.from : NEUTRAL_TEXT }}>
                {active ? `${pct}%` : '–'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= GRAFICO A CIAMBELLA PER GENERE =================
   Stessa logica del grafico continenti, applicata ai generi.
   Colori identici a quelli usati nella lista sotto e in Libreria,
   così il grafico è leggibile a colpo d'occhio come "riepilogo"
   di ciò che si vede nelle righe elencate più in basso. */
function GenreDonut({ list }: { list: [string, Book[]][] }) {
  const entries = list.map(([genre, books]) => ({
    name: genre,
    count: books.length,
    accent: genreColorFor(genre)
  }))

  const total = entries.reduce((sum, e) => sum + e.count, 0)

  const r = 62
  const strokeWidth = 22
  const circumference = 2 * Math.PI * r

  let cumulative = 0

  return (
    <div style={styles.donutWrap}>
      <svg viewBox="0 0 180 180" style={styles.donutSvg}>
        <circle
          cx={90} cy={90} r={r}
          fill="none"
          stroke="#DCD5C4"
          strokeWidth={strokeWidth}
        />

        {total > 0 && entries.map(e => {
          const arcLength = (e.count / total) * circumference
          const offset = -(cumulative / total) * circumference
          cumulative += e.count

          return (
            <circle
              key={e.name}
              cx={90} cy={90} r={r}
              fill="none"
              stroke={e.accent.from}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
            />
          )
        })}

        <text x={90} y={84} textAnchor="middle" style={{ fontSize: 28, fontWeight: 800, fill: INK }}>
          {total}
        </text>
        <text x={90} y={104} textAnchor="middle" style={{ fontSize: 9.5, fontWeight: 700, fill: '#8A7B68', letterSpacing: 0.5 }}>
          LIBRI CLASSIFICATI
        </text>
      </svg>

      <div style={styles.donutLegend}>
        {entries.map(e => {
          const pct = total > 0 ? Math.round((e.count / total) * 100) : 0

          return (
            <div key={e.name} style={styles.donutLegendRow}>
              <span style={{ ...styles.donutLegendDot, background: e.accent.from }} />
              <span style={styles.donutLegendName}>{e.name}</span>
              <span style={{ ...styles.donutLegendCount, color: e.accent.from }}>
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= GRAFICO A CIAMBELLA PER LUNGHEZZA =================
   Stessa logica dei due grafici precedenti, applicata alle categorie
   di lunghezza. L'ordine segue sempre LENGTH_ORDER (dal più corto al
   più lungo) invece che il conteggio, per restare leggibile come
   progressione — coerente con l'elenco sottostante. */
function LengthDonut({ list }: { list: [string, Book[]][] }) {
  const entries = list.map(([category, books]) => ({
    name: category,
    count: books.length,
    accent: lengthColorFor(category)
  }))

  const total = entries.reduce((sum, e) => sum + e.count, 0)

  const r = 62
  const strokeWidth = 22
  const circumference = 2 * Math.PI * r

  let cumulative = 0

  return (
    <div style={styles.donutWrap}>
      <svg viewBox="0 0 180 180" style={styles.donutSvg}>
        <circle
          cx={90} cy={90} r={r}
          fill="none"
          stroke="#DCD5C4"
          strokeWidth={strokeWidth}
        />

        {total > 0 && entries.map(e => {
          const arcLength = (e.count / total) * circumference
          const offset = -(cumulative / total) * circumference
          cumulative += e.count

          return (
            <circle
              key={e.name}
              cx={90} cy={90} r={r}
              fill="none"
              stroke={e.accent.from}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
            />
          )
        })}

        <text x={90} y={84} textAnchor="middle" style={{ fontSize: 28, fontWeight: 800, fill: INK }}>
          {total}
        </text>
        <text x={90} y={104} textAnchor="middle" style={{ fontSize: 9.5, fontWeight: 700, fill: '#8A7B68', letterSpacing: 0.5 }}>
          LIBRI CLASSIFICATI
        </text>
      </svg>

      <div style={styles.donutLegend}>
        {entries.map(e => {
          const pct = total > 0 ? Math.round((e.count / total) * 100) : 0

          return (
            <div key={e.name} style={styles.donutLegendRow}>
              <span style={{ ...styles.donutLegendDot, background: e.accent.from }} />
              <span style={styles.donutLegendName}>{e.name}</span>
              <span style={{ ...styles.donutLegendCount, color: e.accent.from }}>
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= STILI AGGIORNATI ================= */
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 12, background: PAPER, padding: '4px 2px 20px' },
  title: { fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, "Iowan Old Style", serif', color: INK, margin: 0 },
  back: { padding: '8px 12px', borderRadius: 10, border: `1px solid ${PAPER_MUTED}`, background: '#fff', color: INK, cursor: 'pointer', width: 'fit-content', fontSize: 13, fontWeight: 600 },
  homeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card3d: { padding: 16, borderRadius: 18, color: '#fff', boxShadow: '0 10px 22px rgba(43,33,24,0.18)', cursor: 'pointer' },
  cardIcon: { fontSize: 18, opacity: 0.9 },
  cardTitle: { fontSize: 15, fontWeight: 800, marginTop: 6 },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  statsCard: { display: 'flex', justifyContent: 'center', gap: 20, padding: 14, borderRadius: 16, background: '#fff', border: `1px solid ${PAPER_MUTED}` },
  statsBlock: { display: 'flex', gap: 10, alignItems: 'center' },
  statsIcon: { fontSize: 20 },
  statsNumber: { fontSize: 18, fontWeight: 800, color: INK },
  statsLabel: { fontSize: 11, color: '#8A7B68' },
  statsDivider: { width: 1, background: PAPER_MUTED },
  search: { padding: 12, border: `1px solid ${PAPER_MUTED}`, borderRadius: 14, background: '#fff', color: INK, fontSize: 14 },
  alphabet: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  letter: { padding: '4px 8px', borderRadius: 8, border: `1px solid ${PAPER_MUTED}`, cursor: 'pointer', fontSize: 12 },
  stack: { display: 'flex', flexDirection: 'column', gap: 10 },
  rowCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, border: `1px solid ${PAPER_MUTED}`, background: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(43,33,24,0.05)' },
  rowTitle: { fontSize: 14, fontWeight: 700, color: INK },
  rowTitleWithDot: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: INK },
  genreDotInline: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  periodLabel: { display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 4, rowGap: 2 },
  periodYears: { fontSize: 14, fontWeight: 800, color: INK },
  periodDesc: { fontSize: 12.5, fontWeight: 400, color: '#8A7B68', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: 0 },
  pill: { fontSize: 11, background: '#eef2ff', padding: '2px 10px', borderRadius: 999, fontWeight: 700, color: '#4f46e5' },

  mapCard: {
    padding: '16px',
    borderRadius: '18px',
    background: '#fff',
    border: `1px solid ${PAPER_MUTED}`,
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  mapTitle: { fontSize: 14, fontWeight: 700, color: INK, margin: 0, textAlign: 'center' },
  mapNote: { fontSize: 11, color: '#8A7B68', fontStyle: 'italic', margin: 0, textAlign: 'center' },

  donutWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px'
  },
  donutSvg: {
    width: '150px',
    height: '150px',
    display: 'block'
  },
  donutLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    width: '100%',
    maxWidth: '260px'
  },
  donutLegendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px'
  },
  donutLegendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0
  },
  donutLegendName: {
    fontWeight: 700,
    flex: 1
  },
  donutLegendCount: {
    fontWeight: 700,
    fontSize: '12px'
  },
  
  bookCard: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: '12px', 
    padding: 14, 
    borderRadius: 14, 
    border: `1px solid ${PAPER_MUTED}`, 
    background: '#fff', 
    marginBottom: 8,
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)',
    position: 'relative'
  },

  genreDot: {
    position: 'absolute',
    top: '12px',
    right: '14px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  
  cover: {
    width: '60px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: `1px solid ${PAPER_MUTED}`,
    flexShrink: 0
  },
  coverPlaceholder: {
    width: '60px',
    height: '90px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    flexShrink: 0
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1
  },
  
  bookTitle: { fontSize: 14, fontWeight: 700, color: INK, fontFamily: 'Georgia, "Iowan Old Style", serif', paddingRight: 16 },
  pagesMeta: { fontSize: 11, color: '#8A7B68', margin: 0 },
  readingMeta: { fontSize: 11, color: '#8A7B68', marginTop: 4 },
  metaLine: { fontSize: 12, color: '#8A7B68', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' },
  letterHeader: { fontSize: 14, fontWeight: 800, color: TEAL.from, marginTop: 12, marginBottom: 6 },
  resetLetters: {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 999,
    border: 'none',
    background: `linear-gradient(145deg, ${TEAL.from}, ${TEAL.to})`,
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    boxShadow: '0 8px 18px rgba(27,75,67,0.25)'
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
    borderRadius: '18px',
    background: '#fff',
    border: `1px dashed ${PAPER_MUTED}`
  },
  emptyIcon: { fontSize: '28px', margin: 0 },
  emptyText: { fontSize: '13px', color: '#8A7B68', marginTop: '6px' }
}
