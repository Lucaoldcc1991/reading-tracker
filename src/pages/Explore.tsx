import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  readingMonth?: number
  readingYear?: number
  publicationYear?: number
  classic?: boolean
}

const MONTHS = [
  'Gennaio','Febbraio','Marzo','Aprile',
  'Maggio','Giugno','Luglio','Agosto',
  'Settembre','Ottobre','Novembre','Dicembre'
]

type View = 'home' | 'genres' | 'classics' | 'authorsAll' | 'periods'

type AuthorItem = {
  author: string
  count: number
  surname: string
  name: string
}

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([])
  const [view, setView] = useState<View>('home')

  const [globalAuthor, setGlobalAuthor] = useState<string | null>(null)
  const [searchAuthor, setSearchAuthor] = useState('')
  const [letterFilter, setLetterFilter] = useState<string | null>(null)

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const getPeriod = (year?: number) => {
    if (!year) return 'Sconosciuto'
    if (year < 1800) return 'Pre-1800'
    if (year < 1850) return '1800–1849'
    if (year < 1900) return '1850–1899'
    if (year < 1915) return '1900–1914'
    if (year < 1946) return '1915–1945'
    if (year < 1980) return '1946–1979'
    if (year < 2000) return '1980–1999'
    return '2000+'
  }

  const periods = useMemo(() => {
    const map: Record<string, Book[]> = {}

    books.forEach(b => {
      const period = getPeriod(b.publicationYear ?? b.readingYear)
      if (!map[period]) map[period] = []
      map[period].push(b)
    })

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
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
    } else {
      setView('home')
    }
  }

  const renderBookList = (list: Book[]) => (
    <>
      <div style={styles.metaLine}>📖 {list.length} libri</div>

      {list.map(b => {
        const month = b.readingMonth
          ? MONTHS[b.readingMonth - 1]
          : ''

        return (
          <div key={b.id} style={styles.bookCard}>
            <div style={styles.bookTitle}>{b.title}</div>

            {month && b.readingYear && (
              <div style={styles.readingMeta}>
                📅 {month} {b.readingYear}
              </div>
            )}
          </div>
        )
      })}
    </>
  )

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔍 Esplora</h2>

      {view !== 'home' && (
        <button style={styles.back} onClick={goBack}>
          ← Indietro
        </button>
      )}

      {view === 'home' && (
        <div style={styles.homeGrid}>
          <div style={styles.card3d} onClick={() => setView('authorsAll')}>
            <div style={styles.cardTitle}>👤 Autori</div>
            <div style={styles.cardDesc}>Esplora gli autori</div>
          </div>

          <div style={styles.card3d} onClick={() => setView('genres')}>
            <div style={styles.cardTitle}>📚 Generi</div>
            <div style={styles.cardDesc}>Esplora i libri per categoria</div>
          </div>

          <div style={styles.card3d} onClick={() => setView('classics')}>
            <div style={styles.cardTitle}>🏛️ Classici</div>
            <div style={styles.cardDesc}>Autori e opere classiche</div>
          </div>

          <div style={styles.card3d} onClick={() => setView('periods')}>
            <div style={styles.cardTitle}>⏳ Periodi storici</div>
            <div style={styles.cardDesc}>Esplora per epoca</div>
          </div>
        </div>
      )}

      {view === 'periods' && !selectedPeriod && (
        <div style={styles.stack}>
          {periods.map(([period, list]) => (
            <div
              key={period}
              style={styles.rowCard}
              onClick={() => setSelectedPeriod(period)}
            >
              <span style={styles.rowTitle}>{period}</span>
              <span style={styles.pill}>{list.length}</span>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ SOLO SEZIONE PERIODI MODIFICATA */}
      {view === 'periods' && selectedPeriod && (
        <div>
          <div style={styles.metaLine}>
            📖 {booksByPeriod.length} libri
          </div>

          {booksByPeriod.map(b => {
            const month = b.readingMonth
              ? MONTHS[b.readingMonth - 1]
              : ''

            return (
              <div key={b.id} style={styles.bookCard}>
                <div style={styles.bookTitle}>{b.title}</div>

                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {b.author} · {b.publicationYear ?? '—'}
                </div>

                {month && b.readingYear && (
                  <div style={styles.readingMeta}>
                    📅 {month} {b.readingYear}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
                  background: letterFilter === l ? '#4f46e5' : '#fff',
                  color: letterFilter === l ? '#fff' : '#111'
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
        renderBookList(booksByGlobalAuthor)
      }
    </div>
  )
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 12 },
  title: { fontSize: 20, fontWeight: 800 },
  back: { padding: '8px 10px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', width: 'fit-content' },
  homeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card3d: { padding: 16, borderRadius: 16, background: 'linear-gradient(145deg, #ffffff, #f9fafb)', border: '1px solid rgba(229,231,235,0.8)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', cursor: 'pointer' },
  cardTitle: { fontSize: 16, fontWeight: 800 },
  cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  statsCard: { display: 'flex', justifyContent: 'center', gap: 20, padding: 14, borderRadius: 16, background: '#fff', border: '1px solid #eee' },
  statsBlock: { display: 'flex', gap: 10, alignItems: 'center' },
  statsIcon: { fontSize: 20 },
  statsNumber: { fontSize: 18, fontWeight: 800 },
  statsLabel: { fontSize: 11, color: '#6b7280' },
  statsDivider: { width: 1, background: '#eee' },
  search: { padding: 10, border: '1px solid #ddd', borderRadius: 10 },
  alphabet: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  letter: { padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' },
  stack: { display: 'flex', flexDirection: 'column', gap: 10 },
  rowCard: { display: 'flex', justifyContent: 'space-between', padding: 14, borderRadius: 14, border: '1px solid #eee', background: '#fff', cursor: 'pointer' },
  rowTitle: { fontSize: 14, fontWeight: 700 },
  pill: { fontSize: 11, background: '#eef2ff', padding: '2px 10px', borderRadius: 999, fontWeight: 600, color: '#4f46e5' },
  bookCard: { padding: 12, borderRadius: 12, border: '1px solid #eee', background: '#fff' },
  bookTitle: { fontSize: 14, fontWeight: 600 },
  readingMeta: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  metaLine: { fontSize: 12, color: '#6b7280', marginBottom: 6 },

  resetLetters: {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(145deg, #4f46e5, #6366f1)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    boxShadow: '0 8px 18px rgba(79,70,229,0.25)'
  }
}