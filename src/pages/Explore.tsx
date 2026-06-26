import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  readingMonth?: number
  readingYear?: number
}

const genreEmoji: Record<string, string> = {
  'Giallo/Noir/Legal': '🕵️',
  'Thriller': '🔪',
  'Horror/Gotico/Paranormale': '🕷️',
  'Realista/Psicologico/Filosofico': '🧠',
  'Narrativa per ragazzi': '🧒',
  'Saggio': '📖',
  'Fumetto': '🦸',
  'Storico/Di formazione/Autobiografico': '🏛️',
  'Fantascienza': '🚀',
  'Fantasy': '🐉',
  'Avventura': '🧭',
  'Distopico': '⚠️'
}

const MONTHS = [
  'Gennaio','Febbraio','Marzo','Aprile',
  'Maggio','Giugno','Luglio','Agosto',
  'Settembre','Ottobre','Novembre','Dicembre'
]

type View = 'genres' | 'authors' | 'books'

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([])
  const [view, setView] = useState<View>('genres')

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  /* =========================
     GENRES ORDINATI PER NUMERO LIBRI
  ========================= */
  const genreCountsMap = useMemo(() => {
    return books.reduce((acc: Record<string, number>, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1
      return acc
    }, {})
  }, [books])

  const genres = Object.entries(genreCountsMap)
    .sort((a, b) => b[1] - a[1]) // più libri → sopra
    .map(([genre]) => genre)

  const genreCounts = (genre: string) =>
    books.filter(b => b.genre === genre).length

  const authorsByGenre = () => {
    const filtered = books.filter(b => b.genre === selectedGenre)
    const map: Record<string, number> = {}

    filtered.forEach(b => {
      map[b.author] = (map[b.author] || 0) + 1
    })

    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }

  const booksByAuthor = books
    .filter(b =>
      b.genre === selectedGenre &&
      b.author === selectedAuthor
    )
    .sort((a, b) => {
      const aKey = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bKey = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
      return bKey - aKey
    })

  const goBack = () => {
    if (view === 'books') {
      setView('authors')
      setSelectedAuthor(null)
    } else if (view === 'authors') {
      setView('genres')
      setSelectedGenre(null)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔍 Esplora</h2>

      {view !== 'genres' && (
        <button style={styles.back} onClick={goBack}>
          ← Indietro
        </button>
      )}

      {/* ================= GENRES ================= */}
      {view === 'genres' && (
        <div style={styles.stack}>
          {genres.map(g => (
            <div
              key={g}
              style={styles.rowCard}
              onClick={() => {
                setSelectedGenre(g)
                setView('authors')
              }}
            >
              <div style={styles.rowLeft}>
                <span>{genreEmoji[g] || '📚'}</span>
                <span style={styles.rowTitle}>{g}</span>
              </div>

              <span style={styles.pill}>
                {genreCounts(g)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ================= AUTHORS ================= */}
      {view === 'authors' && selectedGenre && (
        <div style={styles.stack}>
          {authorsByGenre().map(([author, count], i) => {
            const badge =
              i === 0 ? '🥇' :
              i === 1 ? '🥈' :
              i === 2 ? '🥉' : ''

            return (
              <div
                key={author}
                style={styles.rowCard}
                onClick={() => {
                  setSelectedAuthor(author)
                  setView('books')
                }}
              >
                <div style={styles.rowLeft}>
                  <span style={styles.rowTitle}>
                    {badge} {author}
                  </span>
                </div>

                <span style={styles.pill}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= BOOKS ================= */}
      {view === 'books' && selectedAuthor && (
        <>
          <div style={styles.infoBar}>
            📊 {booksByAuthor.length} libri
          </div>

          <div style={styles.list}>
            {booksByAuthor.map(b => {
              const monthName =
                b.readingMonth
                  ? MONTHS[b.readingMonth - 1]
                  : ''

              return (
                <div key={b.id} style={styles.bookCard}>
                  <div style={styles.bookTitle}>{b.title}</div>

                  {monthName && b.readingYear && (
                    <div style={styles.readingPill}>
                      {monthName} {b.readingYear}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/* ======================
   STILI
====================== */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827'
  },

  back: {
    padding: '8px 10px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    width: 'fit-content'
  },

  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  rowCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid rgba(229,231,235,0.8)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
    cursor: 'pointer'
  },

  rowLeft: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },

  rowTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827'
  },

  pill: {
    fontSize: '11px',
    background: '#eef2ff',
    padding: '2px 10px',
    borderRadius: '999px',
    fontWeight: 600,
    color: '#4f46e5'
  },

  infoBar: {
    padding: '10px 12px',
    borderRadius: '12px',
    background: '#fff',
    border: '1px solid #eee',
    fontSize: '13px',
    fontWeight: 500
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  bookCard: {
    padding: '12px',
    borderRadius: '12px',
    background: '#fff',
    border: '1px solid #eee',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  },

  bookTitle: {
    fontWeight: 700
  },

  readingPill: {
    marginTop: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    padding: '3px 10px',
    borderRadius: '999px',
    background: '#ecfdf5',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  }
}