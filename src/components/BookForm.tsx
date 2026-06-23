import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  pages: number
  publicationYear?: number
  readingMonth?: number
  readingYear?: number
}

const GENRES = [
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

const MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre'
]

export default function BookForm({
  book,
  onClose
}: {
  book: Book | null
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [series, setSeries] = useState('')
  const [pages, setPages] = useState<number>(0)
  const [publicationYear, setPublicationYear] = useState<number | ''>('')
  const [readingMonth, setReadingMonth] = useState<number | ''>('')
  const [readingYear, setReadingYear] = useState<number | ''>('')

  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setAuthor(book.author)
      setGenre(book.genre)
      setSeries(book.series || '')
      setPages(book.pages || 0)
      setPublicationYear(book.publicationYear || '')
      setReadingMonth(book.readingMonth || '')
      setReadingYear(book.readingYear || '')
    }
  }, [book])

  const save = async () => {
    if (!title || !author || !genre) return

    const payload = {
      title,
      author,
      genre,
      series,
      pages,
      publicationYear: publicationYear || undefined,
      readingMonth: readingMonth || undefined,
      readingYear: readingYear || undefined
    }

    if (book?.id) {
      await db.books.update(book.id, payload)
    } else {
      await db.books.add({
        ...payload,
        createdAt: Date.now()
      } as any)
    }

    onClose()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>
          {book ? 'Modifica libro' : 'Aggiungi libro'}
        </h3>

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

        {/* GENERE */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={styles.input}
        >
          <option value="">Seleziona genere</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          placeholder="Serie (opzionale)"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Anno pubblicazione"
          value={publicationYear}
          onChange={(e) =>
            setPublicationYear(Number(e.target.value))
          }
          style={styles.input}
        />

        {/* PAGINE (senza frecce visibili via CSS) */}
        <input
          type="number"
          placeholder="Pagine"
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          style={styles.input}
        />

        {/* MESE */}
        <select
          value={readingMonth}
          onChange={(e) =>
            setReadingMonth(Number(e.target.value))
          }
          style={styles.input}
        >
          <option value="">Mese di lettura</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>

        {/* ANNO LETTURA */}
        <input
          type="number"
          placeholder="Anno di lettura"
          value={readingYear}
          onChange={(e) =>
            setReadingYear(Number(e.target.value))
          }
          style={styles.input}
        />

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancel}>
            Annulla
          </button>

          <button onClick={save} style={styles.save}>
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}

/* STILI */

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px'
  },
  modal: {
    width: '100%',
    maxWidth: '380px',
    background: '#fff',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  title: {
    fontSize: '16px',
    fontWeight: 600
  },
  input: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '14px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px'
  },
  cancel: {
    background: '#f3f3f3',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px'
  },
  save: {
    background: '#e8edff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    fontWeight: 500
  }
}