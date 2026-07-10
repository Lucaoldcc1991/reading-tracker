import { useEffect, useState } from 'react'
import { db } from '../db/database'
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
  createdAt?: number
  classic?: boolean
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
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
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

  const [cover, setCover] = useState<string>('')

  const [pages, setPages] = useState<number>(0)

  const [publicationYear, setPublicationYear] =
    useState<number | ''>('')

  const [readingMonth, setReadingMonth] =
    useState<number | ''>('')

  const [readingYear, setReadingYear] =
    useState<number | ''>('')

  const [classic, setClassic] =
    useState(false)



  useEffect(() => {

    if (book) {

      setTitle(book.title)
      setAuthor(book.author)
      setGenre(book.genre)
      setSeries(book.series || '')
      setCountry(book.country || '')
      setCover(book.cover || '')

      setPages(book.pages || 0)

      setPublicationYear(
        book.publicationYear || ''
      )

      setReadingMonth(
        book.readingMonth || ''
      )

      setReadingYear(
        book.readingYear || ''
      )

      setClassic(
        book.classic || false
      )

    }

  }, [book])
    const handleCoverUpload = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    const img = new Image()

    img.onload = () => {
      const MAX_WIDTH = 180
      const MAX_HEIGHT = 270

      let width = img.width
      let height = img.height

      const ratio = Math.min(
        MAX_WIDTH / width,
        MAX_HEIGHT / height,
        1
      )

      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(img, 0, 0, width, height)

      const base64 = canvas.toDataURL(
        'image/jpeg',
        0.82
      )

      setCover(base64)
    }

    img.src = reader.result as string
  }

  reader.readAsDataURL(file)
}



  const save = async () => {

    if (!title || !author || !genre) return


    const payload = {

      title,

      author,

      genre,

      series,

      country,

      cover,

      pages,

      publicationYear:
        publicationYear || undefined,

      readingMonth:
        readingMonth || undefined,

      readingYear:
        readingYear || undefined,

      classic

    }


    if (book?.id) {

      await db.books.update(
        book.id,
        payload
      )

    } else {

      await db.books.add({

        ...payload,

        createdAt: Date.now()

      } as any)

    }


    onClose()

  }



  return (
    <>
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>


      <div style={styles.overlay}>

        <div style={styles.modal}>


          <h3 style={styles.title}>
            {book ? 'Modifica libro' : 'Aggiungi libro'}
          </h3>
                    <input
            style={styles.input}
            placeholder="Titolo"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />


          <input
            style={styles.input}
            placeholder="Autore"
            value={author}
            onChange={(e) =>
              setAuthor(e.target.value)
            }
          />


          <select
            style={styles.input}
            value={genre}
            onChange={(e) =>
              setGenre(e.target.value)
            }
          >

            <option value="">
              Genere
            </option>

            {GENRES.map(g => (
              <option
                key={g}
                value={g}
              >
                {g}
              </option>
            ))}

          </select>


          <input
            style={styles.input}
            placeholder="Serie (opzionale)"
            value={series}
            onChange={(e) =>
              setSeries(e.target.value)
            }
          />


          <select
            style={styles.input}
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          >

            <option value="">
              Paese
            </option>

            {COUNTRIES.map(c => (

              <option
                key={c.code}
                value={c.name}
              >
                {c.flag} {c.name}
              </option>

            ))}

          </select>



          {/* COPERTINA */}

          <label style={styles.coverLabel}>
            📷 Copertina libro

            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              style={styles.fileInput}
            />

          </label>


          {cover && (

            <img
              src={cover}
              alt="Anteprima copertina"
              style={styles.preview}
            />

          )}



          <input
            style={styles.input}
            type="number"
            placeholder="Pagine"
            value={pages}
            onChange={(e) =>
              setPages(
                Number(e.target.value)
              )
            }
          />


          <input
            style={styles.input}
            type="number"
            placeholder="Anno pubblicazione"
            value={publicationYear}
            onChange={(e) =>
              setPublicationYear(
                Number(e.target.value)
              )
            }
          />



          <select
            style={styles.input}
            value={readingMonth}
            onChange={(e) =>
              setReadingMonth(
                Number(e.target.value)
              )
            }
          >

            <option value="">
              Mese lettura
            </option>


            {MONTHS.map((m, i) => (

              <option
                key={m}
                value={i + 1}
              >
                {m}
              </option>

            ))}

          </select>



          <input
            style={styles.input}
            type="number"
            placeholder="Anno lettura"
            value={readingYear}
            onChange={(e) =>
              setReadingYear(
                Number(e.target.value)
              )
            }
          />



          <label
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center'
            }}
          >

            <input
              type="checkbox"
              checked={classic}
              onChange={(e) =>
                setClassic(
                  e.target.checked
                )
              }
            />

            🏛 Classico

          </label>



          <div style={styles.actions}>

            <button
              onClick={onClose}
              style={styles.cancel}
            >
              Annulla
            </button>


            <button
              onClick={save}
              style={styles.save}
            >
              Salva
            </button>

          </div>


        </div>

      </div>

    </>
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


  title: {
    fontSize: '16px',
    fontWeight: 600
  },


  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },


  coverLabel: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px dashed #ccc',
    cursor: 'pointer',
    fontSize: '14px'
  },


  fileInput: {
    display: 'block',
    marginTop: '8px'
  },


  preview: {
    width: '80px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #ddd',
    alignSelf: 'center'
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