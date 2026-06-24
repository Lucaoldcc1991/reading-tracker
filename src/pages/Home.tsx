import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  pages: number
  readingYear?: number
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1

  const readBooks = books.filter((b) => b.readingYear)

  const booksThisYear = readBooks.filter(
    (b) => b.readingYear === currentYear
  )

  const booksLastYear = readBooks.filter(
    (b) => b.readingYear === previousYear
  )

  const pagesThisYear = booksThisYear.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const pagesLastYear = booksLastYear.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  /* =========================
     NOTIFICHE LOGIC
  ========================= */

  useEffect(() => {
    const booksKey = 'rt_books_notified'
    const pagesKey = 'rt_pages_notified'

    const booksNotified = localStorage.getItem(booksKey)
    const pagesNotified = localStorage.getItem(pagesKey)

    if (booksThisYear.length > booksLastYear.length && !booksNotified) {
      setToast('🎉 Hai superato i libri dell’anno scorso!')

      localStorage.setItem(booksKey, 'true')

      setTimeout(() => setToast(null), 3000)
    }

    if (pagesThisYear > pagesLastYear && !pagesNotified) {
      setTimeout(() => {
        setToast('📚 Hai superato le pagine dell’anno scorso!')

        localStorage.setItem(pagesKey, 'true')

        setTimeout(() => setToast(null), 3000)
      }, 3500)
    }
  }, [booksThisYear.length, pagesThisYear, pagesLastYear])

  /* =========================
     HOME KPI (STEP 3 RESTA)
     (non modificati qui per non rompere release)
  ========================= */

  const readBooksThisYear = booksThisYear

  const authorsThisYear = new Set(
    readBooksThisYear.map((b) => b.author)
  )

  const authorsPreviousYears = new Set(
    readBooks
      .filter((b) => b.readingYear && b.readingYear < currentYear)
      .map((b) => b.author)
  )

  const newAuthorsThisYear = [...authorsThisYear].filter(
    (a) => !authorsPreviousYears.has(a)
  )

  const longestThisYear = [...readBooksThisYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

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
        <span style={{ fontSize: "30px" }}>🏠</span>
        <span>Home</span>
      </h2>

      {/* TOAST */}
      {toast && (
        <div style={styles.toast}>
          {toast}
        </div>
      )}

      <div style={styles.grid}>
        <Card
          title="Libri letti quest'anno"
          value={booksThisYear.length}
        />

        <Card
          title="Pagine lette quest'anno"
          value={pagesThisYear}
        />

        <Card
          title="Nuovi autori scoperti"
          value={newAuthorsThisYear.length}
        />

        <Card
          title="Libro più lungo dell'anno"
          value={
            longestThisYear
              ? `${longestThisYear.title} - ${longestThisYear.author} (${longestThisYear.pages} pagine)`
              : '-'
          }
        />
      </div>
    </div>
  )
}

/* COMPONENTE CARD */

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

/* STILI */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  grid: {
    display: 'grid',
    gap: '10px'
  },

  card: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #eee',
    background: '#fff'
  },

  cardTitle: {
    fontSize: '13px',
    color: '#777'
  },

  cardValue: {
    fontSize: '18px',
    fontWeight: 600
  },

  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111827',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    zIndex: 9999,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  }
}