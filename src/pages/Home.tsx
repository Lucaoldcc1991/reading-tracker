import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  pages: number
  readingYear?: number
  classic?: boolean
  isClassic?: boolean
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

  const isClassic = (b: Book) =>
    b.classic === true || (b as any).isClassic === true

  const classicsThisYear = booksThisYear.filter(isClassic)
  const classicsLastYear = booksLastYear.filter(isClassic)

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

  const diff = (a: number, b: number) => a - b

  const color = (n: number) =>
    n > 0 ? '#16a34a' : n < 0 ? '#dc2626' : '#6b7280'

  const format = (n: number) => (n > 0 ? `+${n}` : `${n}`)

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📚 Home</h2>

      {/* ================= QUEST’ANNO ================= */}
      <h3 style={styles.sectionTitle}>📖 Letture di quest’anno</h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksThisYear.length} />
        <Card title="Pagine lette" value={pagesThisYear} />
        <Card title="Nuovi autori" value={newAuthorsThisYear.length} />
        <Card title="Classici" value={classicsThisYear.length} />
      </div>

      <BookCard title="Libro più lungo" book={longestThisYear} />

      {/* ================= INSIGHT CARD UNIFICATA ================= */}
      <h3 style={styles.sectionTitle}>
        📊 Rispetto all’anno precedente
      </h3>

      <div style={styles.insightsCard}>
        <div style={styles.insightRow}>
          <span>📚 Libri</span>
          <span style={{ color: color(diff(booksThisYear.length, booksLastYear.length)), fontWeight: 700 }}>
            {format(diff(booksThisYear.length, booksLastYear.length))}
          </span>
        </div>

        <div style={styles.insightRow}>
          <span>📄 Pagine</span>
          <span style={{ color: color(diff(pagesThisYear, pagesLastYear)), fontWeight: 700 }}>
            {pagesThisYear - pagesLastYear > 0
              ? `+${(pagesThisYear - pagesLastYear).toLocaleString()}`
              : (pagesThisYear - pagesLastYear).toLocaleString()}
          </span>
        </div>

        <div style={styles.insightRow}>
          <span>✍️ Autori</span>
          <span style={{ color: color(diff(newAuthorsThisYear.length, newAuthorsLastYear)), fontWeight: 700 }}>
            {format(diff(newAuthorsThisYear.length, newAuthorsLastYear))}
          </span>
        </div>

        <div style={styles.insightRow}>
          <span>🏛️ Classici</span>
          <span style={{ color: color(diff(classicsThisYear.length, classicsLastYear.length)), fontWeight: 700 }}>
            {format(diff(classicsThisYear.length, classicsLastYear.length))}
          </span>
        </div>

        <div style={styles.divider} />

        <p style={styles.subTitle}>🏆 Libro più lungo {previousYear}</p>

        {longestLastYear ? (
          <div style={styles.lastYearBook}>
            <p style={styles.bookTitleSmall}>
              {longestLastYear.title}
            </p>
            <p style={styles.bookMetaSmall}>
              {longestLastYear.author} · {longestLastYear.pages} pagine
            </p>
          </div>
        ) : (
          <p style={styles.bookMetaSmall}>-</p>
        )}
      </div>
    </div>
  )
}

/* ================= COMPONENTI ================= */

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

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

/* ================= STILI ================= */

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

  /* ================= 3D CARD STYLE (HOME UPDATED) ================= */
  card: {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid rgba(229,231,235,0.8)',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',

    boxShadow:
      '0 6px 15px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)',

    transition: 'all 0.25s ease'
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
    border: '1px solid #eee',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
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

  insightsCard: {
    padding: '14px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  insightRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: 500
  },

  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '6px 0'
  },

  subTitle: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 600
  },

  lastYearBook: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  bookTitleSmall: {
    fontSize: '13px',
    fontWeight: 700
  },

  bookMetaSmall: {
    fontSize: '12px',
    color: '#6b7280'
  }
}