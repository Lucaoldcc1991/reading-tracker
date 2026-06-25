import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  pages: number
  readingYear?: number
  classic?: boolean
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

  /* =========================
     FIX CLASSICI (ROBUSTO)
  ========================= */

  const classicsThisYear = booksThisYear.filter(
    (b) => b.classic === true
  )

  const classicsLastYear = booksLastYear.filter(
    (b) => b.classic === true
  )

  const authorsThisYear = new Set(
    booksThisYear.map((b) => b.author)
  )

  const authorsPreviousYears = new Set(
    readBooks
      .filter((b) => b.readingYear && b.readingYear < currentYear)
      .map((b) => b.author)
  )

  const newAuthorsThisYear = [...authorsThisYear].filter(
    (a) => !authorsPreviousYears.has(a)
  )

  const authorsBeforeLastYear = new Set(
    readBooks
      .filter((b) => b.readingYear && b.readingYear < previousYear)
      .map((b) => b.author)
  )

  const newAuthorsLastYear = [
    ...new Set(booksLastYear.map((b) => b.author))
  ].filter((a) => !authorsBeforeLastYear.has(a)).length

  const longestThisYear = [...booksThisYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  const longestLastYear = [...booksLastYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📚 Home</h2>

      {/* QUEST’ANNO */}
      <h3 style={styles.sectionTitle}>Quest’anno</h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksThisYear.length} />
        <Card title="Pagine lette" value={pagesThisYear} />
        <Card title="Nuovi autori" value={newAuthorsThisYear.length} />
        <Card title="Classici" value={classicsThisYear.length} />
      </div>

      <BookCard title="Libro più lungo" book={longestThisYear} />

      {/* CONFRONTO */}
      <h3 style={styles.sectionTitle}>
        Confronto con {previousYear}
      </h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksLastYear.length} />
        <Card title="Pagine lette" value={pagesLastYear} />
        <Card title="Nuovi autori" value={newAuthorsLastYear} />
        <Card title="Classici" value={classicsLastYear.length} />
      </div>

      <BookCard title="Libro più lungo" book={longestLastYear} />
    </div>
  )
}

/* CARD */
function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

/* BOOK CARD */
function BookCard({ title, book }: { title: string; book?: any }) {
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
    fontWeight: 700
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
  }
}