import { useEffect, useState } from 'react'
import { db } from '../db/database'
import BookForm from '../components/BookForm'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
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
      b.genre.toLowerCase().includes(q)
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

  return (
    <div style={styles.container}>
      <h2
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: 700,
    color: "#1f2937",
  }}
>
  <span style={{ fontSize: "30px" }}>📚</span>
  <span>Libreria</span>
</h2>

      {/* SEARCH */}
      <input
        placeholder="Cerca per titolo, autore o genere..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* ADD */}
      <button onClick={openAdd} style={styles.add}>
        + Aggiungi libro
      </button>

      {/* FORM */}
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

      {/* LISTA */}
      <div style={styles.list}>
        {filteredBooks.map((book) => (
          <div key={book.id} style={styles.card}>
            <div style={styles.info}>
              <p style={styles.titleBook}>{book.title}</p>

              <p style={styles.meta}>
                {book.author} · {book.genre}
              </p>

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

            <button
              onClick={() => openEdit(book)}
              style={styles.edit}
            >
              ✏️ Modifica
            </button>
          </div>
        ))}
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
    fontSize: '20px',
    fontWeight: 600
  },
  search: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    outline: 'none'
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
  edit: {
    background: '#f3f3ff',
    border: 'none',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer'
  }
}