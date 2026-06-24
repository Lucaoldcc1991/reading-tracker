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

  const readBooks = books.filter((b) => b.readingYear)

  const readBooksThisYear = readBooks.filter(
    (b) => b.readingYear === currentYear
  )

  const totalReadBooks = readBooks.length

  const totalReadPages = readBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const pagesThisYear = readBooksThisYear.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const longestReadBook = [...readBooks].sort(
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

      <div style={styles.grid}>
        <Card title="Totale libri letti" value={totalReadBooks} />

        <Card title="Totale pagine lette" value={totalReadPages} />

        <Card
          title="Libri letti quest'anno"
          value={readBooksThisYear.length}
        />

        <Card
          title="Pagine lette quest'anno"
          value={pagesThisYear}
        />

        <Card
          title="Libro letto più lungo"
          value={
            longestReadBook
              ? `${longestReadBook.title} (${longestReadBook.pages} pagine · ${longestReadBook.readingYear})`
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
  title: {
    fontSize: '20px',
    fontWeight: 600
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