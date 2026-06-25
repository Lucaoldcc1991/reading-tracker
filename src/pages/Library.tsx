import { useEffect, useState } from 'react'
import { db } from '../db/database'
import BookForm from '../components/BookForm'

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
  createdAt: number
}

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
      (b.series || '').toLowerCase().includes(q) ||
      (b.country || '').toLowerCase().includes(q)
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

  const getFlag = (country?: string) => {
    if (!country) return ''
    return country
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📚 Libreria</h2>

      <div style={styles.counter}>
        📊 {filteredBooks.length} libri
      </div>

      <input
        placeholder="Cerca titolo, autore, genere, serie o paese..."
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
        {filteredBooks.map((book) => (
          <div key={book.id} style={styles.card}>
            <div style={styles.info}>
              <p style={styles.titleBook}>{book.title}</p>

              <p style={styles.meta}>
                {book.author} · {book.genre}
              </p>

              {book.series && (
                <p style={styles.meta}>
                  📚 Serie: {book.series}
                </p>
              )}

              {book.country && (
                <p style={styles.country}>
                  {getFlag(book.country)} {book.country}
                </p>
              )}

              <p style={styles.meta}>
                {book.publicationYear
                  ? `Pubblicazione: ${book.publicationYear} · `
                  : ''}
                {book.pages} pagine
              </p>

              <p style={styles.meta}>
                {book.readingMonth && book.readingYear
                  ? `Letto: ${book.readingMonth}/${book.readingYear}`
                  : 'Non letto'}
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
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================
   STILI
========================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  header: {
    fontSize: '22px',
    fontWeight: 700
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
    fontSize: '15px'
  },

  meta: {
    fontSize: '13px',
    color: '#666'
  },

  country: {
    fontSize: '13px',
    color: '#444'
  },

  actions: {
    display: 'flex',
    gap: '8px'
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