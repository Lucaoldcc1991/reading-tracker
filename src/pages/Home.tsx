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

  const authorsThisYear = new Set(
    booksThisYear.map((b) => b.author)
  )

  const authorsLastYears = new Set(
    readBooks
      .filter((b) => b.readingYear && b.readingYear < currentYear)
      .map((b) => b.author)
  )

  const newAuthorsThisYear = [...authorsThisYear].filter(
    (a) => !authorsLastYears.has(a)
  )

  const classicsThisYear = booksThisYear.filter(
    (b: any) => b.isClassic
  )

  const classicsLastYear = booksLastYear.filter(
    (b: any) => b.isClassic
  )

  const longestThisYear = [...booksThisYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  const longestLastYear = [...booksLastYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 Dashboard lettura</h2>

      {/* =======================
          ANNO CORRENTE
      ======================= */}
      <h3 style={styles.sectionTitle}>
        Attività {currentYear}
      </h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksThisYear.length} />
        <Card title="Pagine lette" value={pagesThisYear} />
        <Card title="Nuovi autori" value={newAuthorsThisYear.length} />
        <Card title="Classici" value={classicsThisYear.length} />
      </div>

      <BookCard
        title="Libro più lungo dell’anno"
        book={longestThisYear}
      />

      {/* =======================
          ANNO PRECEDENTE
      ======================= */}
      <h3 style={styles.sectionTitle}>
        Confronto con il {previousYear}
      </h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksLastYear.length} />
        <Card title="Pagine lette" value={pagesLastYear} />
        <Card title="Nuovi autori" value={authorsLastYears.size} />
        <Card title="Classici" value={classicsLastYear.length} />
      </div>

      <BookCard
        title="Libro più lungo dell’anno"
        book={longestLastYear}
      />
    </div>
  )
}

/* =========================
   CARD KPI
========================= */

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

/* =========================
   BOOK CARD (NUOVA UI)
========================= */

function BookCard({
  title,
  book
}: {
  title: string
  book?: { title: string; author: string; pages: number }
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

/* =========================
   STILI
========================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  title: {
    fontSize: '22px',
    fontWeight: 700
  },

  sectionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    marginTop: '10px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
    fontSize: '16px',
    fontWeight: 600
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
    fontWeight: 700,
    color: '#111'
  },

  bookAuthor: {
    fontSize: '13px',
    color: '#555'
  },

  bookPages: {
    fontSize: '13px',
    color: '#777'
  }
}