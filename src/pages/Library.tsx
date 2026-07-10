import { useEffect, useRef, useState } from 'react'
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
  cover?: string
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

  const [openSwipeId, setOpenSwipeId] = useState<number | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    const data = await db.books.toArray()

    const sorted = data.sort((a, b) => {
      const aScore = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bScore = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)

      if (bScore !== aScore) return bScore - aScore
      return (b.createdAt ?? 0) - (a.createdAt ?? 0)
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

  const swipeState = useRef<Record<number, {
    startX: number
    startY: number
    offset: number
    swiping: boolean
  }>>({})

  const handleTouchStart = (
    e: React.TouchEvent,
    id?: number
  ) => {
    if (!id) return

    swipeState.current[id] = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      offset: 0,
      swiping: false
    }
  }

  const handleTouchMove = (
    e: React.TouchEvent,
    id?: number
  ) => {
    if (!id) return

    const state = swipeState.current[id]

    if (!state) return

    const deltaX =
      e.touches[0].clientX - state.startX

    const deltaY =
      e.touches[0].clientY - state.startY

    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    if (!state.swiping && Math.abs(deltaX) < 25) return

    state.swiping = true

    if (deltaX < 0) {
      state.offset = Math.max(deltaX, -120)
    } else {
      state.offset = 0
    }
  }

  const handleTouchEnd = (id?: number) => {
    if (!id) return

    const state = swipeState.current[id]

    if (!state) return

    if (state.offset < -90) {
      setOpenSwipeId(id)
    } else {
      setOpenSwipeId(null)
    }

    delete swipeState.current[id]
  }

  const getOffset = (id?: number) => {
    if (!id) return 0

    return openSwipeId === id ? -120 : 0
  }
    return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 Libreria</h2>

      <div style={styles.counter}>
        📖 {filteredBooks.length} libri
      </div>

      <input
        placeholder="Cerca libro..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

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

      <button
        onClick={openAdd}
        style={styles.add}
      >
        + Aggiungi libro
      </button>


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
            MONTHS[book.readingMonth - 1]


          return (

            <div
              key={book.id}
              style={styles.swipeWrapper}
            >

              <div style={styles.actionsBehind}>

                <button
                  style={styles.edit}
                  onClick={() => openEdit(book)}
                >
                  ✏️
                </button>


                <button
                  style={styles.delete}
                  onClick={() => deleteBook(book.id)}
                >
                  🗑
                </button>

              </div>



              <div

                style={{
                  ...styles.card,
                  transform:
                    `translateX(${getOffset(book.id)}px)`
                }}

                onTouchStart={(e) =>
                  handleTouchStart(e, book.id)
                }

                onTouchMove={(e) =>
                  handleTouchMove(e, book.id)
                }

                onTouchEnd={() =>
                  handleTouchEnd(book.id)
                }

                onClick={() =>
                  setOpenSwipeId(null)
                }

              >


                {book.cover ? (

                  <img
                    src={book.cover}
                    alt={book.title}
                    style={styles.cover}
                  />

                ) : (

                  <div style={styles.coverPlaceholder}>
                    📕
                  </div>

                )}



                <div style={styles.info}>

                  <p style={styles.titleBook}>
                    {book.title}
                  </p>


                  <p style={styles.meta}>
                    {book.author} · {book.genre}
                  </p>


                  <p style={styles.countryRow}>
                    {country?.flag} {country?.name}
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
                      ? `📅 ${monthName} ${book.readingYear}`
                      : ''}

                  </p>


                </div>


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
    fontSize: '20px',
    fontWeight: 700
  },


  counter: {
    fontSize: '13px',
    color: '#6b7280'
  },


  search: {
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid #eee'
  },


  add: {
  padding: '10px',
  borderRadius: '10px',
  border: 'none',
  background: '#eef2ff',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(99,102,241,0.15)'
},


  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },


  swipeWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '18px'
  },


  actionsBehind: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '120px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: '#fef2f2'
  },
    card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    borderRadius: '18px',
    background: '#fff',
    border: '1px solid #eee',
    transition: 'transform 0.2s ease',
    touchAction: 'pan-y'
  },


  cover: {
    width: '60px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #ddd',
    flexShrink: 0
  },


  coverPlaceholder: {
    width: '60px',
    height: '90px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: '#f3f4f6',
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


  titleBook: {
    fontWeight: 700
  },


  meta: {
    fontSize: 13,
    color: '#6b7280'
  },


  countryRow: {
    fontSize: 13
  },


  series: {
    fontSize: 13,
    fontStyle: 'italic'
  },


  reading: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: 700
  },


  edit: {
    background: '#fff',
    border: '1px solid #ddd',
    padding: 10,
    borderRadius: 10
  },


  delete: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    padding: 10,
    borderRadius: 10,
    color: '#991b1b'
  },


  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

}