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
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
  'Maggio', 'Giugno', 'Luglio', 'Agosto',
  'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
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

    const confirmDelete = confirm('Eliminare questo libro?')
    if (!confirmDelete) return

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

      {showForm && (
        <BookForm
          book={editingBook}
          onClose={() => {
            setShowForm(false)
            setEditingBook(null)
            loadBooks()
          }}
        />
      )}

      <div style={styles.list}>
        {filteredBooks.map((book, index) => {
          const country = COUNTRIES.find(
            (c) => c.name === book.country
          )

          return (
            <div key={book.id} style={styles.card}>
              <div style={styles.info}>

                <p style={styles.titleBook}>
                  <span style={styles.indexInline}>
                    #{index + 1}
                  </span>{' '}
                  {book.title}
                </p>

                {/* AUTORE + GENERE */}
                <p style={styles.meta}>
                  {book.author} · {book.genre}
                </p>

                {/* PAESE SUBITO SOTTO */}
                <p style={styles.countryRow}>
                  {country ? (
                    <>
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>

                {/* SERIE */}
                {book.series && (
                  <p style={styles.meta}>
                    📚 Serie: {book.series}
                  </p>
                )}

                {/* PUBBLICAZIONE + PAGINE */}
                <p style={styles.meta}>
                  {book.publicationYear
                    ? `Pubblicazione: ${book.publicationYear} · `
                    : ''}
                  {book.pages} pagine
                </p>

                {/* LETTURA */}
                <p style={styles.meta}>
                  {book.readingMonth && book.readingYear
                    ? `Letto: ${MONTHS[book.readingMonth - 1]} ${book.readingYear}`
                    : 'Non letto'}
                </p>

                {book.classic && (
                  <p style={styles.classic}>📖 Classico</p>
                )}
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
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* STILI */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1f2937'
  },

  counter: {
    fontSize: '13px',
    color: '#666'
  },

  search: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd'
  },

  add: {
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: '#eef2ff',
    cursor: 'pointer',
    fontWeight: 500
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px',
    border: '1px solid #eee',
    borderRadius: '12px',
    background: '#fff'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  titleBook: {
    fontWeight: 600,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  indexInline: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#4f46e5',
    background: '#eef2ff',
    padding: '2px 6px',
    borderRadius: '999px'
  },

  meta: {
    fontSize: '13px',
    color: '#666'
  },

  countryRow: {
    fontSize: '13px',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    color: '#444'
  },

  classic: {
    fontSize: '12px',
    color: '#6366f1',
    fontWeight: 600
  },

  actions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'start'
  },

  edit: {
    background: '#f3f3ff',
    border: 'none',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  delete: {
    background: '#fee2e2',
    border: 'none',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#991b1b',
    fontWeight: 700
  }
}