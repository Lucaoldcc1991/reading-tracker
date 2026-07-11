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

const INK = '#2B2118'
const PAPER = '#FBF7F1'
const PAPER_MUTED = '#F3EDE3'

/* Colori "generici" di interfaccia (non legati al genere) */
const UI_TEAL = { from: '#1B4B43', to: '#0F332D', soft: '#E4EFEC' }
const UI_RED_SOFT = '#FDE8E8'

type GenreColor = { from: string; to: string; soft: string }

/* ================= COLORE PER GENERE =================
   Ogni famiglia di generi ha un colore fisso e riconoscibile,
   così il dorso del libro comunica subito il tipo di lettura. */
const GENRE_COLOR_MAP: { match: string[]; color: GenreColor }[] = [
  { // Giallo / Noir / Legal → giallo
    match: ['giallo', 'noir', 'legal'],
    color: { from: '#D4AC0D', to: '#A17E09', soft: '#FBF1CC' }
  },
  { // Thriller → blu
    match: ['thriller'],
    color: { from: '#1D4ED8', to: '#173F9E', soft: '#DCE6FB' }
  },
  { // Horror / Gotico / Paranormale → viola
    match: ['horror', 'gotic', 'paranormal'],
    color: { from: '#6D28D9', to: '#4C1D95', soft: '#E9E1FB' }
  },
  { // Realista / Psicologico / Filosofico → rosso
    match: ['realis', 'psicolog', 'filosof'],
    color: { from: '#B91C1C', to: '#7F1414', soft: '#FBE0E0' }
  },
  { // Narrativa per ragazzi → azzurro
    match: ['ragazz'],
    color: { from: '#2E9CE0', to: '#1D6FA8', soft: '#DDEFFB' }
  },
  { // Saggio / Saggistica → verde fosforescente
    match: ['saggi'],
    color: { from: '#2EE86B', to: '#159244', soft: '#E1FAEA' }
  },
  { // Fumetto / Graphic novel → azzurro chiaro
    match: ['fumett', 'graphic', 'manga'],
    color: { from: '#7DD3FC', to: '#38A9DE', soft: '#EAF7FE' }
  },
  { // Storico / Formazione / Autobiografico → marrone
    match: ['storic', 'formazione', 'autobiograf'],
    color: { from: '#8B5E34', to: '#5E3D1F', soft: '#F1E6D8' }
  },
  { // Fantascienza → verde acqua
    match: ['fantascienza', 'sci-fi', 'sci fi'],
    color: { from: '#14B8A6', to: '#0D7A6F', soft: '#DBF5F2' }
  },
  { // Fantasy → arancione fosforescente
    match: ['fantasy'],
    color: { from: '#FF8A00', to: '#C96500', soft: '#FFEBD1' }
  },
  { // Avventura → verde salvia
    match: ['avventura'],
    color: { from: '#8FAE7D', to: '#66815A', soft: '#EAF1E5' }
  },
  { // Distopico → nero
    match: ['distopi'],
    color: { from: '#1F2328', to: '#000000', soft: '#E7E7E7' }
  }
]

const GENRE_FALLBACK: GenreColor = { from: '#8A7B68', to: '#5C4E3D', soft: PAPER_MUTED }

const genreColorFor = (genre?: string): GenreColor => {
  if (!genre) return GENRE_FALLBACK
  const g = genre.toLowerCase()
  const found = GENRE_COLOR_MAP.find(entry =>
    entry.match.some(keyword => g.includes(keyword))
  )
  return found ? found.color : GENRE_FALLBACK
}

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
      <h2 style={styles.title}>La tua libreria</h2>

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

          const spine = genreColorFor(book.genre)

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
                  borderLeft: `4px solid ${spine.from}`,
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

                  <div
                    style={{
                      ...styles.coverPlaceholder,
                      background: spine.soft,
                      color: spine.from
                    }}
                  >
                    📕
                  </div>

                )}



                <div style={styles.info}>

                  <p style={styles.titleBook}>
                    {book.title}
                  </p>


                  <p style={styles.meta}>
                    {book.author} · <span style={{ color: spine.from, fontWeight: 700 }}>{book.genre}</span>
                  </p>


                  <p style={styles.countryRow}>
                    {country?.flag} {country?.name}
                  </p>



                  {book.series && (

                    <p style={styles.series}>
                      📖 {book.series}
                    </p>

                  )}



                  <p style={styles.meta}>
                    {book.pages} pagine
                  </p>



                  {monthName && book.readingYear && (

                    <p style={styles.reading}>
                      📅 {monthName} {book.readingYear}
                    </p>

                  )}

                  {book.classic && (
                    <span style={styles.classicIcon}>🏛️</span>
                  )}

                </div>


              </div>

            </div>

          )

        })}

        {filteredBooks.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📚</p>
            <p style={styles.emptyText}>Nessun libro trovato.</p>
          </div>
        )}

      </div>

    </div>
  )
}


/* STILI */

const styles: Record<string, React.CSSProperties> = {

  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: PAPER,
    padding: '4px 2px 20px'
  },


  title: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    color: INK,
    margin: 0
  },


  counter: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#8A7B68',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },


  search: {
    padding: '12px 14px',
    borderRadius: '14px',
    border: `1px solid ${PAPER_MUTED}`,
    background: '#fff',
    color: INK,
    fontSize: '14px'
  },


  add: {
    padding: '12px',
    borderRadius: '14px',
    border: 'none',
    background: `linear-gradient(145deg, ${UI_TEAL.from}, ${UI_TEAL.to})`,
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(27,75,67,0.25)'
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
    background: UI_RED_SOFT
  },
    card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    borderRadius: '18px',
    background: '#fff',
    border: `1px solid ${PAPER_MUTED}`,
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)',
    transition: 'transform 0.2s ease',
    touchAction: 'pan-y'
  },


  cover: {
    width: '60px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: `1px solid ${PAPER_MUTED}`,
    flexShrink: 0
  },


  coverPlaceholder: {
    width: '60px',
    height: '90px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.06)',
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
    flex: 1,
    position: 'relative'
  },


  titleBook: {
    fontWeight: 700,
    color: INK,
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    fontSize: '15px',
    margin: 0
  },


  meta: {
    fontSize: 13,
    color: '#6b6152',
    margin: 0
  },


  countryRow: {
    fontSize: 13,
    color: '#6b6152',
    margin: 0
  },


  series: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#8A7B68',
    margin: 0
  },


  reading: {
    fontSize: 11,
    color: UI_TEAL.from,
    fontWeight: 700,
    margin: 0
  },


  edit: {
    background: '#fff',
    border: `1px solid ${PAPER_MUTED}`,
    padding: 10,
    borderRadius: 10,
    cursor: 'pointer'
  },


  delete: {
    background: '#fde8e8',
    border: '1px solid #f0b8b8',
    padding: 10,
    borderRadius: 10,
    color: '#8f2e2e',
    cursor: 'pointer'
  },


  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(43,33,24,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  classicIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    fontSize: '16px'
  },

  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
    borderRadius: '18px',
    background: '#fff',
    border: `1px dashed ${PAPER_MUTED}`
  },

  emptyIcon: {
    fontSize: '28px',
    margin: 0
  },

  emptyText: {
    fontSize: '13px',
    color: '#8A7B68',
    marginTop: '6px'
  }

}