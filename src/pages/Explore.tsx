import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  readingMonth?: number
  readingYear?: number
  classic?: boolean
}

const genreIcons: Record<string, string> = {
  'Giallo/Noir/Legal': '🕵🏻‍♂️',
  'Thriller': '🔪',
  'Horror/Gotico/Paranormale': '🧟‍♂️',
  'Realista/Psicologico/Filosofico': '🧠',
  'Narrativa per ragazzi': '🎎',
  'Saggio': '📖',
  'Fumetto': '🃏',
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

type View = 'home' | 'genres' | 'classics' | 'authors' | 'books'

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([])
  const [view, setView] = useState<View>('home')

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  /* ================= GENERI ================= */
  const genreCountsMap = useMemo(() => {
    return books.reduce((acc: Record<string, number>, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1
      return acc
    }, {})
  }, [books])

  const genres = Object.entries(genreCountsMap)
    .sort((a, b) => b[1] - a[1])
    .map(([genre]) => genre)

  const genreCounts = (genre: string) =>
    books.filter(b => b.genre === genre).length

  /* ================= AUTORI ================= */
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

  /* ================= CLASSICI ================= */
  const classicBooks = books.filter(b => b.classic)

  const classicsByAuthor = useMemo(() => {
    const map: Record<string, Book[]> = {}

    classicBooks.forEach(b => {
      if (!map[b.author]) map[b.author] = []
      map[b.author].push(b)
    })

    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [classicBooks])

  const classicsBySelectedAuthor: Book[] = useMemo(() => {
    if (!selectedAuthor) return []

    return classicBooks
      .filter(b => b.author === selectedAuthor)
      .sort((a, b) => {
        const aKey = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
        const bKey = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
        return bKey - aKey
      })
  }, [selectedAuthor, classicBooks])

  /* ================= BACK ================= */
  const goBack = () => {
    if (view === 'books') {
      setView('authors')
      setSelectedAuthor(null)
    }
    else if (view === 'authors') {
      setView('genres')
      setSelectedGenre(null)
    }
    else if (view === 'classics') {
      if (selectedAuthor) {
        setSelectedAuthor(null)
      } else {
        setView('home')
      }
    }
    else {
      setView('home')
    }
  }

  const renderBookList = (list: Book[]) => (
    <>
      <div style={styles.metaLine}>
        📖 {list.length} libri
      </div>

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

      {/* HOME */}
      {view === 'home' && (
        <div style={styles.homeGrid}>
          <div style={styles.card3d} onClick={() => setView('genres')}>
            <div style={styles.cardTitle}>📚 Generi</div>
            <div style={styles.cardDesc}>Esplora i libri per categoria</div>
          </div>

          <div style={styles.card3d} onClick={() => setView('classics')}>
            <div style={styles.cardTitle}>🏛️ Classici</div>
            <div style={styles.cardDesc}>Autori e opere classiche</div>
          </div>
        </div>
      )}

      {/* GENERI */}
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
                <span>{genreIcons[g] || '📚'}</span>
                <span style={styles.rowTitle}>{g}</span>
              </div>
              <span style={styles.pill}>{genreCounts(g)}</span>
            </div>
          ))}
        </div>
      )}

      {/* AUTORI (GENERI) */}
      {view === 'authors' && selectedGenre && (
        <div style={styles.stack}>
          {authorsByGenre().map(([author, count]) => (
            <div
              key={author}
              style={styles.rowCard}
              onClick={() => {
                setSelectedAuthor(author)
                setView('books')
              }}
            >
              <span style={styles.rowTitle}>{author}</span>
              <span style={styles.pill}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* LIBRI (GENERI) */}
      {view === 'books' && selectedAuthor && renderBookList(booksByAuthor)}

      {/* CLASSICI AUTORI */}
      {view === 'classics' && !selectedAuthor && (
        <div style={styles.stack}>
          {classicsByAuthor.map(([author, books]) => (
            <div
              key={author}
              style={styles.rowCard}
              onClick={() => setSelectedAuthor(author)}
            >
              <span style={styles.rowTitle}>{author}</span>
              <span style={styles.pill}>{books.length}</span>
            </div>
          ))}
        </div>
      )}

      {/* CLASSICI LIBRI */}
      {view === 'classics' && selectedAuthor && renderBookList(classicsBySelectedAuthor)}
    </div>
  )
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 12 },

  title: { fontSize: 20, fontWeight: 800, color: '#111827' },

  back: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    width: 'fit-content'
  },

  homeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },

  card3d: {
    padding: 16,
    borderRadius: 16,
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    border: '1px solid rgba(229,231,235,0.8)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    cursor: 'pointer'
  },

  cardTitle: { fontSize: 16, fontWeight: 800 },

  cardDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  stack: { display: 'flex', flexDirection: 'column', gap: 10 },

  rowCard: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    background: '#fff',
    border: '1px solid #eee',
    cursor: 'pointer'
  },

  rowLeft: { display: 'flex', gap: 10, alignItems: 'center' },

  rowTitle: { fontSize: 14, fontWeight: 700 },

  pill: {
    fontSize: 11,
    background: '#eef2ff',
    padding: '2px 10px',
    borderRadius: 999,
    fontWeight: 600,
    color: '#4f46e5'
  },

  bookCard: {
    padding: 12,
    borderRadius: 12,
    background: '#fff',
    border: '1px solid #eee'
  },

  bookTitle: { fontWeight: 600, fontSize: 14 },

  readingMeta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },

  metaLine: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6
  }
}