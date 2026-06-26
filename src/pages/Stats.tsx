import { useEffect, useState } from 'react'
import { db } from '../db/database'
import { COUNTRIES } from '../utils/countries'

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
      : readBooks.filter((b) => String(b.readingYear) === yearFilter)

  const totalBooks = filteredBooks.length

  const totalPages = filteredBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const classicBooks = filteredBooks.filter(
    (b) => b.isClassic === true
  )

  const longestBook =
    filteredBooks.length > 0
      ? [...filteredBooks].sort(
          (a, b) => (b.pages || 0) - (a.pages || 0)
        )[0]
      : null

  const mapCount = (key: keyof Book) => {
    const map: Record<string, number> = {}
    filteredBooks.forEach((b: any) => {
      if (!b[key]) return
      map[b[key]] = (map[b[key]] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }

  const topAuthors = mapCount('author')
  const topGenres = mapCount('genre')

  const countryMap: Record<string, number> = {}
  filteredBooks.forEach((b) => {
    if (!b.country) return
    countryMap[b.country] = (countryMap[b.country] || 0) + 1
  })

  const countries = Object.entries(countryMap).sort(
    (a, b) => b[1] - a[1]
  )

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📊 Statistiche</h2>

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

      {/* ================= KPI 3 COLONNE PERFETTE ================= */}
      <div style={styles.kpiRow}>
        <div style={styles.card3d}>
          <p style={styles.kpiLabel}>Libri</p>
          <p style={styles.kpiValue}>{totalBooks}</p>
        </div>

        <div style={styles.card3d}>
          <p style={styles.kpiLabel}>Pagine</p>
          <p style={styles.kpiValue}>{totalPages}</p>
        </div>

        <div style={styles.card3d}>
          <p style={styles.kpiLabel}>Classici</p>
          <p style={styles.kpiValue}>{classicBooks.length}</p>
        </div>
      </div>

      {/* libro più lungo */}
      <div style={styles.card3d}>
        <p style={styles.kpiLabel}>Libro più lungo</p>

        {longestBook ? (
          <>
            <p style={styles.bookTitle}>{longestBook.title}</p>
            <p style={styles.bookMeta}>{longestBook.author}</p>
            <p style={styles.bookMeta}>{longestBook.pages} pagine</p>
          </>
        ) : (
          <p style={styles.kpiValue}>-</p>
        )}
      </div>

      {/* INSIGHT */}
      <div style={styles.insightCard}>
        <h3 style={styles.sectionTitle}>🏆 Autori</h3>

        {topAuthors.slice(0, 10).map(([author, count], i) => (
          <div key={author} style={styles.row}>
            <span style={styles.inlineRow}>
              {i + 1}° {author}
              <span style={styles.pill}>{count}</span>
            </span>
          </div>
        ))}

        <h3 style={styles.sectionTitle}>🌍 Paesi</h3>

        {countries.slice(0, 10).map(([country, count]) => {
          const c = COUNTRIES.find(x => x.name === country)

          return (
            <div key={country} style={styles.row}>
              <span style={styles.inlineRow}>
                {c?.flag} {country}
                <span style={styles.pill}>{count}</span>
              </span>
            </div>
          )
        })}

        <h3 style={styles.sectionTitle}>📚 Generi</h3>

        {topGenres.slice(0, 10).map(([genre, count]) => (
          <div key={genre} style={styles.row}>
            <span style={styles.inlineRow}>
              {genre}
              <span style={styles.pill}>{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  header: {
    fontSize: '28px',
    fontWeight: 800
  },

  select: {
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid #ddd'
  },

  /* 🔥 ORA PERFETTAMENTE SIMMETRICO */
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },

  card3d: {
    padding: '14px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    border: '1px solid #e5e7eb',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minHeight: '90px'
  },

  kpiLabel: {
    fontSize: '12px',
    color: '#777'
  },

  kpiValue: {
    fontSize: '18px',
    fontWeight: 700
  },

  bookTitle: {
    fontSize: '15px',
    fontWeight: 700
  },

  bookMeta: {
    fontSize: '13px',
    color: '#555'
  },

  insightCard: {
    padding: '14px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    marginTop: '8px'
  },

  row: {
    fontSize: '13px',
    fontWeight: 500
  },

  inlineRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },

  pill: {
    padding: '2px 8px',
    borderRadius: '999px',
    background: '#eef2ff',
    color: '#4f46e5',
    fontSize: '11px',
    fontWeight: 600
  }
}