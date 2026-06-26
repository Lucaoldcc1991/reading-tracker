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

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    const data = await db.books
      .orderBy('createdAt')
      .reverse()
      .toArray()

    setBooks(data)
  }

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      (b.series || '').toLowerCase().includes(q)
    )
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
        📊 {filteredBooks.length} libri
      </div>

      <input
        placeholder="Cerca libro, autore, genere o serie..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      <button onClick={openAdd} style={styles.add}>
        + Aggiungi libro
      </button>

      {/* ================= MODAL FORM ================= */}
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

      <div style={styles.list}>
        {filteredBooks.map((book) => {
          const country = COUNTRIES.find(
            (c) => c.name === book.country
          )

          const monthName =
            book.readingMonth &&
            book.readingMonth >= 1 &&
            book.readingMonth <= 12
              ? MONTHS[book.readingMonth - 1]
              : ''

          return (
            <div
              key={book.id ?? `${book.title}-${book.createdAt}`}
              style={styles.card}
            >

              {/* LEFT */}
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
                  <p style={styles.series}>
                    {book.series}
                  </p>
                )}

                <p style={styles.meta}>
                  {book.pages} pagine
                </p>

                <p style={styles.reading}>
                  {monthName && book.readingYear
                    ? `${monthName} ${book.readingYear}`
                    : ''}
                </p>
              </div>

              {/* ACTIONS */}
              <div style={styles.actions}>
                <button onClick={() => openEdit(book)} style={styles.edit}>✏️</button>
                <button onClick={() => deleteBook(book.id)} style={styles.delete}>🗑</button>
              </div>

              {/* CLASSICO BADGE */}
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

/* =========================
   STILI COMPLETI 3D
========================= */

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
    color: '#666'
  },

  /* 3D INPUT SEARCH */
  search: {
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(229,231,235,0.9)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
    outline: 'none',
    transition: 'all 0.2s ease'
  },

  /* 3D BUTTON */
  add: {
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid rgba(229,231,235,0.8)',
    background: 'linear-gradient(145deg, #eef2ff, #e0e7ff)',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  /* 3D CARD */
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(229,231,235,0.8)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    position: 'relative',
    boxShadow:
      '0 6px 15px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)',
    transition: 'all 0.25s ease'
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
    color: '#111'
  },

  meta: {
    fontSize: '13px',
    color: '#555'
  },

  countryRow: {
    fontSize: '13px',
    color: '#444',
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },

  series: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: '#6b7280'
  },

  reading: {
    alignSelf: 'flex-start',
    marginTop: '4px',
    padding: '2px 8px',
    borderRadius: '999px',
    background: '#ecfdf5',
    color: '#16a34a',
    fontSize: '11px',
    fontWeight: 600
  },

  classicBadge: {
    position: 'absolute',
    right: '14px',
    bottom: '10px',
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: 600
  },

  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    marginLeft: '12px'
  },

  edit: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    background: '#f3f4f6',
    cursor: 'pointer'
  },

  delete: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #fca5a5',
    background: '#fee2e2',
    color: '#991b1b',
    cursor: 'pointer'
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }
}