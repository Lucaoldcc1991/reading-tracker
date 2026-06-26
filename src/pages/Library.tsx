import { useEffect, useState } from 'react'
import { db } from '../db/database'
import BookForm from '../components/BookForm'
import { COUNTRIES } from '../utils/countries'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  pages: number
  publicationYear?: number
  readingMonth?: number
  readingYear?: number
  classic?: boolean
  createdAt: number
}

const MONTHS = [
  'Gennaio','Febbraio','Marzo','Aprile',
  'Maggio','Giugno','Luglio','Agosto',
  'Settembre','Ottobre','Novembre','Dicembre'
]

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    const data = await db.books.toArray()

    const sorted = data.sort((a, b) => {
      const aScore = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bScore = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
      return bScore - aScore
    })

    setBooks(sorted)
  }

  const years = [...new Set(
    books.map(b => b.readingYear).filter(Boolean)
  )]

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase()

    const matchesSearch =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      (b.series || '').toLowerCase().includes(q)

    const matchesYear =
      yearFilter === 'all' || b.readingYear === yearFilter

    return matchesSearch && matchesYear
  })

  const openAdd = () => {
    setEditingBook(null)
    setShowForm(true)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setShowForm(true)
  }

  const deleteBook = async (id?: number) => {
    if (!id) return
    if (!confirm('Eliminare questo libro?')) return
    await db.books.delete(id)
    loadBooks()
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 Libreria</h2>

      <div style={styles.counter}>
        📚 {filteredBooks.length} libri
      </div>

      {/* SEARCH */}
      <input
        placeholder="Cerca libro, autore, genere o serie..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* FILTER YEAR */}
      <select
        value={yearFilter}
        onChange={(e) =>
          setYearFilter(
            e.target.value === 'all'
              ? 'all'
              : Number(e.target.value)
          )
        }
        style={styles.search}
      >
        <option value="all">Tutti gli anni</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* ADD */}
      <button onClick={openAdd} style={styles.add}>
        + Aggiungi libro
      </button>

      {/* MODAL */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <BookForm
            book={editingBook}
            onClose={() => {
              setShowForm(false)
              setEditingBook(null)
              loadBooks()
            }}
          />
        </div>
      )}

      {/* LIST */}
      <div style={styles.list}>
        {filteredBooks.map((book) => {
          const country = COUNTRIES.find(
            (c) => c.name === book.country
          )

          const monthName =
            book.readingMonth &&
            MONTHS[book.readingMonth - 1]

          return (
            <div
              key={book.id ?? `${book.title}-${book.createdAt}`}
              style={styles.card}
            >
              <div style={styles.info}>
                <p style={styles.titleBook}>{book.title}</p>

                <p style={styles.meta}>
                  {book.author} · {book.genre}
                </p>

                <p style={styles.countryRow}>
                  {country?.flag} {country?.name}
                  {book.publicationYear && (
                    <span style={styles.meta}>
                      {' '} - {book.publicationYear}
                    </span>
                  )}
                </p>

                {book.series && (
                  <p style={styles.series}>{book.series}</p>
                )}

                <p style={styles.meta}>
                  {book.pages} pagine
                </p>

                <p style={styles.reading}>
                  {monthName && book.readingYear
                    ? `📅 ${monthName} ${book.readingYear}`
                    : ''}
                </p>
              </div>

              <div style={styles.actions}>
                <button
                  onClick={() => openEdit(book)}
                  style={styles.edit}
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteBook(book.id)}
                  style={styles.delete}
                >
                  🗑
                </button>
              </div>

              {book.classic === true && (
                <div style={styles.classicBadge}>
                  🏛 Classico
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================= STILI 3D ================= */

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

  counter: {
    fontSize: '13px',
    color: '#6b7280'
  },

  /* INPUT 3D */
  search: {
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(229,231,235,0.9)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    boxShadow:
      'inset 2px 2px 5px rgba(0,0,0,0.03), 0 6px 14px rgba(0,0,0,0.05)',
    fontSize: '14px',
    outline: 'none'
  },

  /* BUTTON 3D */
  add: {
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(224,231,255,0.8)',
    background: 'linear-gradient(145deg, #eef2ff, #e0e7ff)',
    boxShadow:
      '0 8px 18px rgba(99,102,241,0.15), 0 2px 4px rgba(0,0,0,0.05)',
    fontWeight: 700,
    cursor: 'pointer'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  /* CARD 3D */
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px',
    borderRadius: '18px',
    border: '1px solid rgba(229,231,235,0.7)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    boxShadow:
      '0 10px 22px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.05)',
    position: 'relative'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },

  titleBook: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#111827'
  },

  meta: {
    fontSize: '13px',
    color: '#6b7280'
  },

  countryRow: {
    fontSize: '13px',
    color: '#4b5563'
  },

  series: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: '#6b7280'
  },

  reading: {
    alignSelf: 'flex-start',
    marginTop: '4px',
    padding: '3px 10px',
    borderRadius: '999px',
    background: 'linear-gradient(145deg, #ecfdf5, #d1fae5)',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    fontSize: '11px',
    fontWeight: 700
  },

  classicBadge: {
    position: 'absolute',
    right: '14px',
    bottom: '10px',
    fontSize: '11px',
    color: '#6b7280'
  },

  actions: {
    display: 'flex',
    gap: '8px'
  },

  edit: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    background: '#fff'
  },

  delete: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    border: '1px solid #fca5a5',
    background: '#fee2e2',
    color: '#991b1b'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }
}