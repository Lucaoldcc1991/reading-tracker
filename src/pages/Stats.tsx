import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  pages: number
  readingYear?: number
  isClassic?: boolean
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

  /* =========================
     KPI BASE
  ========================= */

  const totalBooks = filteredBooks.length

  const totalPages = filteredBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const classicBooks = filteredBooks.filter(
    (b) => b.isClassic === true
  )

  const totalClassics = classicBooks.length

  /* =========================
     LIBRO PIÙ LUNGO
  ========================= */

  const longestBook =
    filteredBooks.length > 0
      ? [...filteredBooks].sort(
          (a, b) => (b.pages || 0) - (a.pages || 0)
        )[0]
      : null

  /* =========================
     AUTORI
  ========================= */

  const authorsMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    authorsMap[b.author] =
      (authorsMap[b.author] || 0) + 1
  })

  const topAuthors = Object.entries(authorsMap)
    .sort((a, b) => b[1] - a[1])

  /* =========================
     PAESI
  ========================= */

  const countryMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    if (!b.country) return
    countryMap[b.country] =
      (countryMap[b.country] || 0) + 1
  })

  const countries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])

  /* =========================
     GENERI
  ========================= */

  const genresMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    genresMap[b.genre] =
      (genresMap[b.genre] || 0) + 1
  })

  const genres = Object.entries(genresMap)
    .sort((a, b) => b[1] - a[1])

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Statistiche</h2>

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

      {/* KPI */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiItem}>
          <p style={styles.kpiLabel}>Libri</p>
          <p style={styles.kpiValue}>{totalBooks}</p>
        </div>

        <div style={styles.kpiItem}>
          <p style={styles.kpiLabel}>Pagine</p>
          <p style={styles.kpiValue}>{totalPages}</p>
        </div>

        <div style={styles.kpiItem}>
          <p style={styles.kpiLabel}>Classici</p>
          <p style={styles.kpiValue}>{totalClassics}</p>
        </div>
      </div>

      {/* LIBRO PIÙ LUNGO */}
      <div style={styles.bookCard}>
        <p style={styles.cardTitle}>Libro più lungo</p>

        {longestBook ? (
          <>
            <p style={styles.bookTitle}>{longestBook.title}</p>
            <p style={styles.bookAuthor}>{longestBook.author}</p>
            <p style={styles.bookPages}>{longestBook.pages} pagine</p>
          </>
        ) : (
          <p style={styles.kpiValue}>-</p>
        )}
      </div>

      {/* AUTORI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🏆 Autori</h3>

        {topAuthors.map(([author, count], i) => (
          <div key={author} style={styles.row}>
            <span>
              {i + 1}° {author} {count}
            </span>
          </div>
        ))}
      </div>

      {/* PAESI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🌍 Paesi</h3>

        {countries.map(([country, count]) => (
          <div key={country} style={styles.row}>
            <span>
              {country} {count}
            </span>
          </div>
        ))}
      </div>

      {/* GENERI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📚 Generi</h3>

        {genres.map(([genre, count]) => (
          <div key={genre} style={styles.row}>
            <span>
              {genre} {count}
            </span>
          </div>
        ))}
      </div>
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
    gap: '12px'
  },

  title: {
    fontSize: '22px',
    fontWeight: 700
  },

  select: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd'
  },

  kpiRow: {
    display: 'flex',
    gap: '10px'
  },

  kpiItem: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #eee',
    background: '#fff'
  },

  kpiLabel: {
    fontSize: '12px',
    color: '#777'
  },

  kpiValue: {
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

  cardTitle: {
    fontSize: '13px',
    color: '#777'
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

  section: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  }
}