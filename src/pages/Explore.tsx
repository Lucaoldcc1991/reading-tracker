import { useEffect, useState } from 'react'
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
  'Horror/Gotico/Paranormale': '👻',
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

  const genres = [...new Set(books.map(b => b.genre))]

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

      {/* GENRES */}
      {view === 'genres' && (
        <div style={styles.grid}>
          {genres.map(g => (
            <div
              key={g}
              style={styles.card}
              onClick={() => {
                setSelectedGenre(g)
                setView('authors')
              }}
            >
              <div style={styles.genreTitle}>
                <span>{genreEmoji[g] || '📚'}</span>
                {g}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AUTHORS */}
      {view === 'authors' && selectedGenre && (
        <div style={styles.grid}>
          {authorsByGenre().map(([author, count], i) => {
            const badge =
              i === 0 ? '🥇' :
              i === 1 ? '🥈' :
              i === 2 ? '🥉' : ''

            return (
              <div
                key={author}
                style={styles.card}
                onClick={() => {
                  setSelectedAuthor(author)
                  setView('books')
                }}
              >
                <div style={styles.authorRow}>
                  <span style={styles.authorName}>
                    {badge} {author}
                  </span>

                  <span style={styles.badge}>{count}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* BOOKS */}
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

                  {/* ✅ PILL IDENTICA ALLA LIBRERIA */}
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

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  card: {
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid rgba(229,231,235,0.8)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
    cursor: 'pointer'
  },

  genreTitle: {
    fontSize: '16px',
    fontWeight: 600,
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },

  authorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  authorName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827'
  },

  badge: {
    fontSize: '11px',
    background: '#eef2ff',
    padding: '2px 8px',
    borderRadius: '999px'
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

  /* ✅ IDENTICA ALLA LIBRERIA */
  readingPill: {
  marginTop: '6px',
  display: 'inline-flex',
  alignItems: 'center',

  /* 🔥 chiave: evita stretching */
  width: 'fit-content',
  maxWidth: '100%',

  padding: '3px 10px',
  borderRadius: '999px',

  background: '#ecfdf5',
  border: '1px solid #bbf7d0',

  color: '#16a34a',
  fontSize: '11px',
  fontWeight: 600,

  lineHeight: '1',
  whiteSpace: 'nowrap'
}
}