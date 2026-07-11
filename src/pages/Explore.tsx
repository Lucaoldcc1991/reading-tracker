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

type View = 'home' | 'genres' | 'classics' | 'authorsAll' | 'periods' | 'series' | 'countries'

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

// Rotazione usata per liste "neutre" (periodi, serie, paesi)
const ROTATION = [TEAL, BURGUNDY, GOLD, PLUM, SAGE, SKY]
const accentAt = (i: number) => ROTATION[i % ROTATION.length]

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

const HOME_CARDS: { view: View; icon: string; title: string; desc: string; accent: Accent }[] = [
  { view: 'authorsAll', icon: '👤', title: 'Autori', desc: 'Esplora gli autori', accent: TEAL },
  { view: 'genres', icon: '📚', title: 'Generi', desc: 'Esplora i libri per categoria', accent: BURGUNDY },
  { view: 'classics', icon: '🏛️', title: 'Classici', desc: 'Autori e opere classiche', accent: GOLD },
  { view: 'periods', icon: '⏳', title: 'Periodi storici', desc: 'Esplora per epoca', accent: PLUM },
  { view: 'series', icon: '📖', title: 'Serie', desc: 'Esplora i libri per saga', accent: SAGE },
  { view: 'countries', icon: '🌍', title: 'Paesi', desc: 'Esplora i libri per provenienza', accent: SKY }
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
    return books
      .filter(b => b.series === selectedSeries)
      .sort((a, b) => a.title.localeCompare(b.title))
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

    return books
      .filter(b => b.author === globalAuthor)
      .sort((a, b) => {
        const aKey = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
        const bKey = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
        return bKey - aKey
      })
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
    } else {
      setView('home')
    }
  }

  // Renderizzatore universale e pulito per TUTTE le schede (Generi, Classici, Periodi, Autori, Serie, Paesi)
  // Ogni libro prende il colore del proprio genere, come in Libreria.
  const renderCleanBookList = (list: Book[]) => (
    <div>
      <div style={styles.metaLine}>📖 {list.length} libri</div>

      {list.map(b => {
        const month = b.readingMonth ? MONTHS[b.readingMonth - 1] : ''
        const accent = genreColorFor(b.genre)

        return (
          <div key={b.id} style={{ ...styles.bookCard, borderLeft: `4px solid ${accent.from}` }}>
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Esplora</h2>

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
          {genresList.map(([genre, list]) => {
            const accent = genreColorFor(genre)
            return (
              <div
                key={genre}
                style={{ ...styles.rowCard, borderLeft: `4px solid ${accent.from}` }}
                onClick={() => setSelectedGenre(genre)}
              >
                <span style={styles.rowTitle}>{genre}</span>
                <span style={{ ...styles.pill, background: accent.soft, color: accent.from }}>{list.length}</span>
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
          {periods.map(([period, list], i) => {
            const accent = accentAt(i)
            return (
              <div
                key={period}
                style={{ ...styles.rowCard, borderLeft: `4px solid ${accent.from}` }}
                onClick={() => setSelectedPeriod(period)}
              >
                <span style={styles.rowTitle}>{period}</span>
                <span style={{ ...styles.pill, background: accent.soft, color: accent.from }}>{list.length}</span>
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
          {seriesList.map(([series, list], i) => {
            const accent = accentAt(i)
            return (
              <div
                key={series}
                style={{ ...styles.rowCard, borderLeft: `4px solid ${accent.from}` }}
                onClick={() => setSelectedSeries(series)}
              >
                <span style={styles.rowTitle}>{series}</span>
                <span style={{ ...styles.pill, background: accent.soft, color: accent.from }}>{list.length}</span>
              </div>
            )
          })}
        </div>
      )}

      {view === 'series' && selectedSeries &&
        renderCleanBookList(booksBySeries)
      }

      {/* 🌍 SEZIONE PAESI */}
      {view === 'countries' && !selectedCountry && (
        <div style={styles.stack}>
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
  rowCard: { display: 'flex', justifyContent: 'space-between', padding: 14, borderRadius: 14, border: `1px solid ${PAPER_MUTED}`, background: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(43,33,24,0.05)' },
  rowTitle: { fontSize: 14, fontWeight: 700, color: INK },
  pill: { fontSize: 11, background: '#eef2ff', padding: '2px 10px', borderRadius: 999, fontWeight: 700, color: '#4f46e5' },
  
  bookCard: { 
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: '12px', 
    padding: 14, 
    borderRadius: 14, 
    border: `1px solid ${PAPER_MUTED}`, 
    background: '#fff', 
    marginBottom: 8,
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)'
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
  
  bookTitle: { fontSize: 14, fontWeight: 700, color: INK, fontFamily: 'Georgia, "Iowan Old Style", serif' },
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
