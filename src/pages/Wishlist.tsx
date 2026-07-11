import { useEffect, useState } from 'react'
import { db } from '../db/database'

type WishlistItem = {
  id?: number
  title: string
  author: string
  genre: string
  createdAt: number
}

const genres = [
  'Giallo/Noir/Legal',
  'Thriller',
  'Horror/Gotico/Paranormale',
  'Realista/Psicologico/Filosofico',
  'Narrativa per ragazzi',
  'Saggio',
  'Fumetto',
  'Storico/Di formazione/Autobiografico',
  'Fantascienza',
  'Fantasy',
  'Avventura',
  'Distopico'
]

const INK = '#2B2118'
const PAPER = '#FBF7F1'
const PAPER_MUTED = '#F3EDE3'
const TEAL_FROM = '#1B4B43'
const TEAL_TO = '#0F332D'

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.wishlist
      .orderBy('createdAt')
      .reverse()
      .toArray()

    setItems(data)
  }

  const addItem = async () => {
    if (!title.trim() || !author.trim() || !genre) return

    await db.wishlist.add({
      title,
      author,
      genre,
      createdAt: Date.now()
    })

    setTitle('')
    setAuthor('')
    setGenre('')
    load()
  }

  const removeItem = async (id?: number) => {
    if (!id) return
    await db.wishlist.delete(id)
    load()
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    return (
      i.title.toLowerCase().includes(q) ||
      i.author.toLowerCase().includes(q) ||
      i.genre.toLowerCase().includes(q)
    )
  })

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>La tua wishlist</h2>
      <p style={styles.eyebrow}>
        {items.length === 0 ? 'Ancora nessun libro in lista' : `${items.length} ${items.length === 1 ? 'libro in lista' : 'libri in lista'}`}
      </p>

      {/* FORM */}
      <div style={styles.form}>
        <p style={styles.formTitle}>Aggiungi un desiderio</p>

        <input
          placeholder="Titolo libro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Autore"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={styles.input}
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={styles.input}
        >
          <option value="">Seleziona genere</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <button onClick={addItem} style={styles.add}>
          + Aggiungi alla wishlist
        </button>
      </div>

      {/* SEARCH */}
      {items.length > 0 && (
        <input
          placeholder="Cerca nella wishlist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
      )}

      {/* LISTA — volutamente neutra: cambia spesso, niente colori per genere */}
      <div style={styles.list}>
        {filtered.map((item) => (
          <div key={item.id} style={styles.card}>

            <div style={styles.info}>
              <p style={styles.titleBook}>
                {item.title}
              </p>

              <p style={styles.meta}>
                {item.author}
              </p>

              <span style={styles.genreTag}>
                {item.genre}
              </span>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              style={styles.delete}
              aria-label="Rimuovi dalla wishlist"
            >
              ✕
            </button>

          </div>
        ))}

        {items.length > 0 && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🔍</p>
            <p style={styles.emptyText}>Nessun risultato per questa ricerca.</p>
          </div>
        )}

        {items.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>⭐</p>
            <p style={styles.emptyText}>La tua wishlist è vuota.<br />Aggiungi il primo libro qui sopra.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* =========================
   STILE COERENTE CON L'APP
========================= */

const styles: Record<string, React.CSSProperties> = {

  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: PAPER,
    padding: '4px 2px 20px'
  },

  header: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    color: INK,
    margin: 0
  },

  eyebrow: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#8A7B68',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: 0
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    borderRadius: '18px',
    background: '#fff',
    border: `1px solid ${PAPER_MUTED}`,
    boxShadow: '0 8px 20px rgba(43,33,24,0.06)'
  },

  formTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: INK,
    margin: '0 0 2px 0'
  },

  input: {
    padding: '12px',
    borderRadius: '12px',
    border: `1px solid ${PAPER_MUTED}`,
    background: PAPER,
    color: INK,
    fontSize: '14px'
  },

  add: {
    marginTop: '4px',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: `linear-gradient(145deg, ${TEAL_FROM}, ${TEAL_TO})`,
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(27,75,67,0.25)'
  },

  search: {
    padding: '12px 14px',
    borderRadius: '14px',
    border: `1px solid ${PAPER_MUTED}`,
    background: '#fff',
    color: INK,
    fontSize: '14px'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  /* Card volutamente neutra e discreta: la wishlist cambia spesso,
     non vale la pena colorarla per genere come in Libreria/Esplora. */
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '14px',
    borderRadius: '14px',
    border: `1px solid ${PAPER_MUTED}`,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },

  titleBook: {
    fontWeight: 700,
    fontSize: '15px',
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    color: INK,
    margin: 0
  },

  meta: {
    fontSize: '13px',
    color: '#6b6152',
    margin: 0
  },

  genreTag: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#8A7B68',
    background: PAPER_MUTED,
    padding: '2px 9px',
    borderRadius: '999px',
    width: 'fit-content',
    marginTop: '2px'
  },

  delete: {
    border: 'none',
    background: '#FDE8E8',
    width: '28px',
    height: '28px',
    borderRadius: '999px',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#8f2e2e',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    marginTop: '6px',
    lineHeight: 1.5
  }
}
