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

  /* ✅ ORA USATO IN UI */
  const longestThisYear = [...booksThisYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 Home</h2>

      {/* KPI ANNO CORRENTE */}
      <div style={styles.grid}>
        <Card title="Libri letti" value={booksThisYear.length} />

        <Card title="Pagine lette" value={pagesThisYear} />

        <Card
          title="Nuovi autori"
          value={newAuthorsThisYear.length}
        />

        <Card
          title="Classici letti"
          value={classicsThisYear.length}
        />

        <Card
          title="Libro più lungo"
          value={
            longestThisYear
              ? `${longestThisYear.title} - ${longestThisYear.author} (${longestThisYear.pages})`
              : '-'
          }
        />
      </div>

      {/* CONFRONTO ANNO PRECEDENTE */}
      <h3 style={styles.subTitle}>
        Confronto {previousYear}
      </h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksLastYear.length} />

        <Card title="Pagine lette" value={pagesLastYear} />

        <Card
          title="Nuovi autori"
          value={authorsLastYears.size}
        />

        <Card
          title="Classici letti"
          value={booksLastYear.filter((b: any) => b.isClassic).length}
        />
      </div>
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

/* STILI */
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

  subTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginTop: '10px'
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
  }
}