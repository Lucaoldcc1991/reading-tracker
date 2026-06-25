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

/* =========================
   GENERI
========================= */

const GENRES = [
  'Giallo/Noir/Legal',
  'Thriller',
  'Horror/Gotico/Paranormale',
  'Realista/Psicologico/Filosofico',
  'Narrativa per ragazzi',
  'Saggio',
  'Fumetto',
  'Storico/Autobiografico',
  'Fantascienza',
  'Fantasy',
  'Avventura',
  'Distopico'
]

/* =========================
   MESI
========================= */

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

/* =========================
   PAESI (semplificato ma completo UI)
   (ISO standard + nomi leggibili)
========================= */

const COUNTRIES = [
  'Italia',
  'Stati Uniti',
  'Regno Unito',
  'Francia',
  'Germania',
  'Spagna',
  'Giappone',
  'Cina',
  'Corea del Sud',
  'Russia',
  'Brasile',
  'Canada',
  'Australia',
  'India',
  'Messico',
  'Svezia',
  'Norvegia',
  'Paesi Bassi',
  'Portogallo',
  'Grecia',
  'Altro'
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

        <input
          style={styles.input}
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Autore"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        {/* GENERE */}
        <select
          style={styles.input}
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">Seleziona genere</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* SERIE */}
        <input
          style={styles.input}
          placeholder="Serie (opzionale)"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
        />

        {/* PAESE */}
        <select
          style={styles.input}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Seleziona paese</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* PAGINE */}
        <input
          style={styles.input}
          type="number"
          placeholder="Pagine"
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
        />

        {/* ANNO PUBBLICAZIONE */}
        <input
          style={styles.input}
          type="number"
          placeholder="Anno pubblicazione"
          value={publicationYear}
          onChange={(e) =>
            setPublicationYear(Number(e.target.value))
          }
        />

        {/* MESE LETTURA */}
        <select
          style={styles.input}
          value={readingMonth}
          onChange={(e) =>
            setReadingMonth(Number(e.target.value))
          }
        >
          <option value="">Mese lettura</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>

        {/* ANNO LETTURA */}
        <input
          style={styles.input}
          type="number"
          placeholder="Anno lettura"
          value={readingYear}
          onChange={(e) =>
            setReadingYear(Number(e.target.value))
          }
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

/* =========================
   STILI
========================= */

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
    background: '#fff',
    padding: '16px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '380px',
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