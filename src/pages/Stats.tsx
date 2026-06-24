import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  genre: string
  pages: number
  readingYear?: number
}

export default function Stats() {
  const [books, setBooks] = useState<Book[]>([])
  const [yearFilter, setYearFilter] = useState<string>('all')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const readBooks = books.filter((b) => b.readingYear)

  const years = Array.from(
    new Set(readBooks.map((b) => b.readingYear))
  ).sort((a, b) => (b as number) - (a as number))

  const filteredBooks =
    yearFilter === 'all'
      ? readBooks
      : readBooks.filter(
          (b) => String(b.readingYear) === yearFilter
        )

  const totalBooks = filteredBooks.length

  const totalPages = filteredBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const authorsMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    authorsMap[b.author] =
      (authorsMap[b.author] || 0) + 1
  })

  const topAuthors = Object.entries(authorsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const genresMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    genresMap[b.genre] =
      (genresMap[b.genre] || 0) + 1
  })

  const genresList = Object.entries(genresMap).sort(
    (a, b) => b[1] - a[1]
  )

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
  <span style={{ fontSize: "30px" }}>📊</span>
  <span>Statistiche</span>
</h2>

      {/* FILTRO ANNO */}
      <select
        value={yearFilter}
        onChange={(e) => setYearFilter(e.target.value)}
        style={styles.select}
      >
        <option value="all">Tutti gli anni</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>

      {/* TOTALI */}
      <div style={styles.card}>
        <p style={styles.label}>Totale libri letti</p>
        <p style={styles.value}>{totalBooks}</p>
      </div>

      <div style={styles.card}>
        <p style={styles.label}>Totale pagine lette</p>
        <p style={styles.value}>{totalPages}</p>
      </div>

      {/* TOP AUTORI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Top 10 autori</h3>

        {topAuthors.map(([author, count], index) => (
          <div key={author} style={styles.row}>
            <span style={styles.leftText}>
              {index + 1}° {author}
              <span style={styles.inlineBadge}>{count}</span>
            </span>
          </div>
        ))}
      </div>

      {/* GENERI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Generi</h3>

        {genresList.map(([genre, count]) => (
          <div key={genre} style={styles.row}>
            <span style={styles.leftText}>
              {genre}
              <span style={styles.inlineBadge}>{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* STILI */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600
  },
  select: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd'
  },
  card: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #eee',
    background: '#fff'
  },
  label: {
    fontSize: '13px',
    color: '#777'
  },
  value: {
    fontSize: '18px',
    fontWeight: 600
  },
  section: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '4px'
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f2f2f2',
    fontSize: '14px'
  },
  leftText: {
    textAlign: 'left',
    flex: 1
  },
  inlineBadge: {
    marginLeft: '6px',
    padding: '2px 7px',
    borderRadius: '999px',
    background: '#eef2ff',
    color: '#3730a3',
    fontSize: '12px',
    fontWeight: 600
  }
}