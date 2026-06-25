import { useEffect, useState } from 'react'
import { db } from '../db/database'

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
}

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
  const [country, setCountry] = useState('')
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
      setCountry(book.country || '')
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
      country,
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

        <input style={styles.input} placeholder="Titolo" value={title}
          onChange={(e) => setTitle(e.target.value)} />

        <input style={styles.input} placeholder="Autore" value={author}
          onChange={(e) => setAuthor(e.target.value)} />

        <input style={styles.input} placeholder="Genere" value={genre}
          onChange={(e) => setGenre(e.target.value)} />

        <input style={styles.input} placeholder="Serie (opzionale)" value={series}
          onChange={(e) => setSeries(e.target.value)} />

        <input style={styles.input} placeholder="Paese (opzionale)" value={country}
          onChange={(e) => setCountry(e.target.value)} />

        <input style={styles.input} type="number" placeholder="Pagine"
          value={pages} onChange={(e) => setPages(Number(e.target.value))} />

        <input style={styles.input} type="number" placeholder="Anno pubblicazione"
          value={publicationYear}
          onChange={(e) => setPublicationYear(Number(e.target.value))} />

        <input style={styles.input} type="number" placeholder="Mese lettura"
          value={readingMonth}
          onChange={(e) => setReadingMonth(Number(e.target.value))} />

        <input style={styles.input} type="number" placeholder="Anno lettura"
          value={readingYear}
          onChange={(e) => setReadingYear(Number(e.target.value))} />

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancel}>Annulla</button>
          <button onClick={save} style={styles.save}>Salva</button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    background: '#fff',
    padding: '16px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  title: { fontSize: '16px', fontWeight: 600 },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px'
  },
  cancel: {
    padding: '8px 12px',
    background: '#f3f3f3',
    border: 'none',
    borderRadius: '8px'
  },
  save: {
    padding: '8px 12px',
    background: '#e8edff',
    border: 'none',
    borderRadius: '8px'
  }
}