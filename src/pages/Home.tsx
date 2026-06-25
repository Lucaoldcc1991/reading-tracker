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

  const longestLastYear = [...booksLastYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        📚 Reading Tracker
      </h2>

      {toast && <div style={styles.toast}>{toast}</div>}

      {/* QUEST’ANNO */}
      <h3 style={styles.sectionTitle}>
        Quest’anno {currentYear}
      </h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksThisYear.length} />
        <Card title="Pagine lette" value={pagesThisYear} />
        <Card title="Nuovi autori" value={newAuthorsThisYear.length} />
      </div>

      <BookCard title="Libro più lungo" book={longestThisYear} />

      {/* ANNO SCORSO */}
      <h3 style={styles.sectionTitle}>
        Anno scorso {previousYear}
      </h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksLastYear.length} />
        <Card title="Pagine lette" value={pagesLastYear} />
      </div>

      <BookCard title="Libro più lungo" book={longestLastYear} />
    </div>
  )
}

/* CARD KPI */
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

/* BOOK CARD STYLE PREMIUM */
function BookCard({
  title,
  book
}: {
  title: string
  book?: any
}) {
  return (
    <div style={styles.bookCard}>
      <p style={styles.cardTitle}>{title}</p>

      {book ? (
        <>
          <p style={styles.bookTitle}>{book.title}</p>
          <p style={styles.bookAuthor}>{book.author}</p>
          <p style={styles.bookPages}>{book.pages} pagine</p>
        </>
      ) : (
        <p style={styles.cardValue}>-</p>
      )}
    </div>
  )
}

/* STILI */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  header: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111'
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#444',
    marginTop: '10px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  card: {
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #eee',
    background: '#fff'
  },

  cardTitle: {
    fontSize: '12px',
    color: '#777'
  },

  cardValue: {
    fontSize: '18px',
    fontWeight: 700
  },

  bookCard: {
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  bookTitle: {
    fontSize: '15px',
    fontWeight: 700
  },

  bookAuthor: {
    fontSize: '13px',
    color: '#555'
  },

  bookPages: {
    fontSize: '13px',
    color: '#777'
  },

  toast: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111827',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px'
  }
}