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
      <h2 style={styles.header}>⭐ Wishlist</h2>

      <p style={styles.counter}>
        Libri in lista: {items.length}
      </p>

      {/* FORM */}
      <div style={styles.form}>
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
          + Aggiungi
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Cerca..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* LISTA */}
      <div style={styles.list}>
        {filtered.map((item) => (
          <div key={item.id} style={styles.card}>

            <div style={styles.info}>

              {/* TITOLO → NON PIÙ INVADENTE */}
              <p style={styles.titleBook}>
                {item.title}
              </p>

              {/* METADATI PIÙ DISCRETI */}
              <p style={styles.meta}>
                {item.author}
              </p>

              <p style={styles.metaSoft}>
                {item.genre}
              </p>

            </div>

            <button
              onClick={() => removeItem(item.id)}
              style={styles.delete}
            >
              ✕
            </button>

          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================
   STILE 3D COERENTE APP
========================= */

const styles: Record<string, React.CSSProperties> = {

  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  header: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827'
  },

  counter: {
    fontSize: '13px',
    color: '#6b7280'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    borderRadius: '14px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
  },

  input: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
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

  search: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)'
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
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },

  /* 👇 TITOLI MENO INVADENTI */
  titleBook: {
    fontWeight: 600,      // ↓ da 700 a 600
    fontSize: '14px',     // ↓ più piccolo
    color: '#111827'
  },

  meta: {
    fontSize: '12px',
    color: '#6b7280'
  },

  metaSoft: {
    fontSize: '11px',
    color: '#9ca3af',
    fontStyle: 'italic'
  },

  delete: {
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#ef4444'
  }
}