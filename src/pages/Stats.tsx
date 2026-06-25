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

  const totalBooks = filteredBooks.length

  const totalPages = filteredBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  /* =========================
     CLASSICI
  ========================= */

  const classicsCount = filteredBooks.filter(
    (b) => b.isClassic
  ).length

  /* =========================
     LIBRO PIÙ LUNGO
  ========================= */

  const longestBook = [...filteredBooks].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  /* =========================
     AUTORI
  ========================= */

  const authorsMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    authorsMap[b.author] =
      (authorsMap[b.author] || 0) + 1
  })

  const topAuthors = Object.entries(authorsMap).sort(
    (a, b) => b[1] - a[1]
  )

  const maxAuthorValue = Math.max(
    ...topAuthors.map((a) => a[1]),
    1
  )

  /* =========================
     GENERI
  ========================= */

  const genresMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    genresMap[b.genre] =
      (genresMap[b.genre] || 0) + 1
  })

  const genresList = Object.entries(genresMap).sort(
    (a, b) => b[1] - a[1]
  )

  /* =========================
     NAZIONI
  ========================= */

  const countryMap: Record<string, number> = {}

  filteredBooks.forEach((b) => {
    if (!b.country) return
    countryMap[b.country] =
      (countryMap[b.country] || 0) + 1
  })

  const countries = Object.entries(countryMap).sort(
    (a, b) => b[1] - a[1]
  )

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
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Libri</p>
          <p style={styles.kpiValue}>{totalBooks}</p>
        </div>

        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Pagine</p>
          <p style={styles.kpiValue}>{totalPages}</p>
        </div>

        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Classici</p>
          <p style={styles.kpiValue}>{classicsCount}</p>
        </div>

        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Libro più lungo</p>
          <p style={styles.kpiValue}>
            {longestBook
              ? `${longestBook.title} - ${longestBook.author} (${longestBook.pages})`
              : '-'}
          </p>
        </div>
      </div>

      {/* LEADERBOARD AUTORI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🏆 Autori</h3>

        {topAuthors.map(([author, count], i) => (
          <div key={author} style={styles.row}>
            <span>
              {i + 1}. {author}
            </span>

            <div style={styles.barWrap}>
              <div
                style={{
                  ...styles.bar,
                  width: `${(count / maxAuthorValue) * 100}%`
                }}
              />
            </div>

            <span style={styles.badge}>{count}</span>
          </div>
        ))}
      </div>

      {/* NAZIONI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🌍 Paesi</h3>

        {countries.map(([country, count]) => (
          <div key={country} style={styles.countryRow}>
            <span>
              {getFlag(country)} {country}
            </span>
            <span style={styles.badge}>{count}</span>
          </div>
        ))}
      </div>

      {/* GENERI */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📚 Generi</h3>

        {genresList.map(([genre, count]) => (
          <div key={genre} style={styles.countryRow}>
            <span>{genre}</span>
            <span style={styles.badge}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* FLAG */
function getFlag(country?: string) {
  switch (country?.toLowerCase()) {
    case 'italia':
    case 'italy':
      return '🇮🇹'
    case 'francia':
    case 'france':
      return '🇫🇷'
    case 'usa':
    case 'stati uniti':
      return '🇺🇸'
    case 'regno unito':
    case 'uk':
      return '🇬🇧'
    case 'giappone':
    case 'japan':
      return '🇯🇵'
    default:
      return '📍'
  }
}

/* STILI */
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '12px' },

  title: { fontSize: '22px', fontWeight: 700 },

  select: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ddd'
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  kpiCard: {
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid #eee',
    background: '#fff'
  },

  kpiLabel: { fontSize: '12px', color: '#777' },

  kpiValue: { fontSize: '18px', fontWeight: 700 },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '10px'
  },

  sectionTitle: { fontSize: '14px', fontWeight: 600 },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    fontSize: '13px'
  },

  barWrap: {
    flex: 1,
    height: '6px',
    background: '#eee',
    borderRadius: '999px',
    overflow: 'hidden'
  },

  bar: {
    height: '100%',
    background: '#6366f1',
    borderRadius: '999px'
  },

  badge: {
    background: '#eef2ff',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '12px'
  },

  countryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px'
  }
}