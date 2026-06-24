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
  <span style={{ fontSize: "30px" }}>⭐</span>
  <span>Wishlist</span>
</h2>

      <p style={styles.counter}>
        Libri in lista: {items.length}
      </p>

      {/* FORM */}
      <div style={styles.form}>
        <input
          placeholder="Titolo"
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

        {/* GENERE SELECT */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={styles.input}
        >
          <option value="">Seleziona genere</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
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
              <p style={styles.titleBook}>{item.title}</p>
              <p style={styles.meta}>
                {item.author} · {item.genre}
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

/* STILI */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600
  },
  counter: {
    fontSize: '13px',
    color: '#666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '12px',
    background: '#fff'
  },
  input: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  add: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: '#eef2ff',
    fontWeight: 500
  },
  search: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    border: '1px solid #eee',
    borderRadius: '10px',
    background: '#fff'
  },
  info: {
    display: 'flex',
    flexDirection: 'column'
  },
  titleBook: {
    fontWeight: 600,
    fontSize: '14px'
  },
  meta: {
    fontSize: '12px',
    color: '#666'
  },
  delete: {
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    cursor: 'pointer'
  }
}