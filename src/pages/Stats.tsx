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
  classic?: boolean
}

type ChartMode = 'books' | 'pages' | 'classics' | 'newAuthors'

export default function Stats() {
  const [books, setBooks] = useState<Book[]>([])
  const [chartMode, setChartMode] = useState<ChartMode>('books')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const readBooks = books.filter((b) => b.readingYear)

  const totalBooks = readBooks.length

  const totalPages = readBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const classicBooks = readBooks.filter((b) => b.classic === true)

  const longestBook =
    readBooks.length > 0
      ? [...readBooks].sort(
          (a, b) => (b.pages || 0) - (a.pages || 0)
        )[0]
      : null

  const mapCount = (key: keyof Book) => {
    const map: Record<string, number> = {}
    readBooks.forEach((b: any) => {
      if (!b[key]) return
      map[b[key]] = (map[b[key]] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }

  const topGenres = mapCount('genre')

  const countryMap: Record<string, number> = {}
  readBooks.forEach((b) => {
    if (!b.country) return
    countryMap[b.country] = (countryMap[b.country] || 0) + 1
  })

  const countries = Object.entries(countryMap).sort(
    (a, b) => b[1] - a[1]
  )

  const evolutionBase = Object.entries(
    readBooks.reduce(
      (acc: Record<number, { books: number; pages: number; classics: number }>, b) => {
        if (!b.readingYear) return acc

        if (!acc[b.readingYear]) {
          acc[b.readingYear] = { books: 0, pages: 0, classics: 0 }
        }

        acc[b.readingYear].books += 1
        acc[b.readingYear].pages += b.pages || 0
        if (b.classic) acc[b.readingYear].classics += 1

        return acc
      },
      {}
    )
  ).sort((a, b) => Number(a[0]) - Number(b[0]))

  /* ⭐ NUOVI AUTORI PER ANNO */
  const allSorted = [...readBooks].sort(
    (a, b) => (a.readingYear || 0) - (b.readingYear || 0)
  )

  const seenAuthors = new Set<string>()
  const newAuthorsByYear: Record<number, number> = {}

  allSorted.forEach((b) => {
    if (!b.readingYear) return

    if (!seenAuthors.has(b.author)) {
      seenAuthors.add(b.author)

      newAuthorsByYear[b.readingYear] =
        (newAuthorsByYear[b.readingYear] || 0) + 1
    }
  })

  const maxValue = Math.max(
    ...evolutionBase.map(([_, d]) => {
      if (chartMode === 'books') return d.books
      if (chartMode === 'pages') return d.pages
      if (chartMode === 'classics') return d.classics
      return (newAuthorsByYear[Number(_)] || 0)
    }),
    1
  )

  const topAuthors = Object.entries(
    readBooks.reduce((acc: Record<string, number>, b) => {
      if (!b.author) return acc
      acc[b.author] = (acc[b.author] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📊 Statistiche</h2>

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

      {/* EVOLUZIONE */}
      <div style={styles.card3d}>
        <div style={styles.chartHeader}>
          <p style={styles.kpiLabel}>📈 Evoluzione</p>

          <div style={styles.switch}>
            <button
              onClick={() => setChartMode('books')}
              style={{
                ...styles.switchBtn,
                background: chartMode === 'books' ? '#4f46e5' : '#eef2ff',
                color: chartMode === 'books' ? '#fff' : '#4f46e5'
              }}
            >
              Libri
            </button>

            <button
              onClick={() => setChartMode('pages')}
              style={{
                ...styles.switchBtn,
                background: chartMode === 'pages' ? '#4f46e5' : '#eef2ff',
                color: chartMode === 'pages' ? '#fff' : '#4f46e5'
              }}
            >
              Pagine
            </button>

            <button
              onClick={() => setChartMode('classics')}
              style={{
                ...styles.switchBtn,
                background: chartMode === 'classics' ? '#4f46e5' : '#eef2ff',
                color: chartMode === 'classics' ? '#fff' : '#4f46e5'
              }}
            >
              Classici
            </button>

            <button
              onClick={() => setChartMode('newAuthors')}
              style={{
                ...styles.switchBtn,
                background: chartMode === 'newAuthors' ? '#4f46e5' : '#eef2ff',
                color: chartMode === 'newAuthors' ? '#fff' : '#4f46e5'
              }}
            >
              Autori scoperti
            </button>
          </div>
        </div>

        <div style={styles.scrollChart}>
          {evolutionBase.map(([year, data]) => {
            const value =
              chartMode === 'books'
                ? data.books
                : chartMode === 'pages'
                ? data.pages
                : chartMode === 'classics'
                ? data.classics
                : (newAuthorsByYear[Number(year)] || 0)

            const height = (value / maxValue) * 100

            return (
              <div key={year} style={styles.columnItem}>
                <div style={styles.columnWrap}>
                  <div
                    style={{
                      ...styles.columnBar,
                      height: `${height}%`
                    }}
                  />
                </div>

                <div style={styles.columnValue}>{value}</div>
                <div style={styles.columnLabel}>{year}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* LIBRO PIÙ LUNGO */}
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
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>✍️ Autori più letti</h3>
          {topAuthors.slice(0, 3).map(([author, count]) => (
            <div key={author} style={styles.row}>
              {author} <span style={styles.pill}>{count}</span>
            </div>
          ))}
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>🌍 Paesi più esplorati</h3>
          {countries.slice(0, 3).map(([country, count]) => {
            const c = COUNTRIES.find(x => x.name === country)
            return (
              <div key={country} style={styles.row}>
                {c?.flag} {country}
                <span style={styles.pill}>{count}</span>
              </div>
            )
          })}
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>📚 Generi preferiti</h3>
          {topGenres.slice(0, 3).map(([genre, count]) => (
            <div key={genre} style={styles.row}>
              {genre} <span style={styles.pill}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* STILI INVARIATI */
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '12px' },
  header: { fontSize: '28px', fontWeight: 800 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  card3d: {
    padding: '14px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
    border: '1px solid #e5e7eb',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
  },
  kpiLabel: { fontSize: '12px', color: '#777' },
  kpiValue: { fontSize: '18px', fontWeight: 700 },
  chartHeader: { display: 'flex', justifyContent: 'space-between' },
  switch: { display: 'flex', gap: '6px' },
  switchBtn: { padding: '4px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px' },
  scrollChart: { display: 'flex', gap: '14px', overflowX: 'auto', marginTop: '12px' },
  columnItem: { minWidth: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  columnWrap: { height: '110px', width: '10px', display: 'flex', alignItems: 'flex-end', background: '#eef2ff', borderRadius: '999px' },
  columnBar: { width: '100%', background: 'linear-gradient(180deg, #4f46e5, #7c3aed)', borderRadius: '12px' },
  columnValue: { fontSize: '10px', marginTop: '6px' },
  columnLabel: { fontSize: '10px', color: '#6b7280' },
  bookTitle: { fontSize: '15px', fontWeight: 700 },
  bookMeta: { fontSize: '13px', color: '#555' },
  insightCard: {
    padding: '14px',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff, #f3f4f6)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionCard: {
    padding: '12px',
    borderRadius: '12px',
    background: '#fff',
    border: '1px solid #eee'
  },
  sectionTitle: { fontSize: '14px', fontWeight: 700, marginBottom: '8px' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    padding: '4px 0'
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