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

type ChartMode = 'books' | 'pages' | 'newAuthors'

export default function Stats() {
  const [books, setBooks] = useState<Book[]>([])
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [chartMode, setChartMode] = useState<ChartMode>('books')
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

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
    (b) => b.classic === true
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

  const topGenres = mapCount('genre')

  const countryMap: Record<string, number> = {}
  filteredBooks.forEach((b) => {
    if (!b.country) return
    countryMap[b.country] = (countryMap[b.country] || 0) + 1
  })

  const countries = Object.entries(countryMap).sort(
    (a, b) => b[1] - a[1]
  )

  /* =========================
     📊 EVOLUZIONE BASE (libri/pagine)
  ========================= */

  const evolutionBase = Object.entries(
    readBooks.reduce(
      (acc: Record<number, { books: number; pages: number }>, b) => {
        if (!b.readingYear) return acc

        if (!acc[b.readingYear]) {
          acc[b.readingYear] = { books: 0, pages: 0 }
        }

        acc[b.readingYear].books += 1
        acc[b.readingYear].pages += b.pages || 0

        return acc
      },
      {}
    )
  ).sort((a, b) => Number(a[0]) - Number(b[0]))

  /* =========================
     🆕 NUOVI AUTORI PER ANNO
  ========================= */

  const allSorted = [...readBooks].sort(
    (a, b) => (a.readingYear || 0) - (b.readingYear || 0)
  )

  const seenAuthors = new Set<string>()
  const newAuthorsByYear: Record<number, Set<string>> = {}

  allSorted.forEach((b) => {
    if (!b.readingYear) return

    if (!seenAuthors.has(b.author)) {
      seenAuthors.add(b.author)

      if (!newAuthorsByYear[b.readingYear]) {
        newAuthorsByYear[b.readingYear] = new Set()
      }

      newAuthorsByYear[b.readingYear].add(b.author)
    }
  })

  const evolutionNewAuthors = Object.entries(newAuthorsByYear)
    .map(([year, set]) => [year, set.size])
    .sort((a, b) => Number(a[0]) - Number(b[0]))

  const maxValue = Math.max(
    ...(chartMode === 'books'
      ? evolutionBase.map(([_, d]) => d.books)
      : chartMode === 'pages'
      ? evolutionBase.map(([_, d]) => d.pages)
      : evolutionNewAuthors.map(([_, v]) => Number(v))),
    1
  )

  const totalAuthors = new Set(
    filteredBooks.map((b) => b.author).filter(Boolean)
  ).size

  const topAuthors = Object.entries(
    filteredBooks.reduce((acc: Record<string, number>, b) => {
      if (!b.author) return acc
      acc[b.author] = (acc[b.author] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const selectedAuthors =
    selectedYear && newAuthorsByYear[Number(selectedYear)]
      ? Array.from(newAuthorsByYear[Number(selectedYear)])
      : []

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

      {/* KPI */}
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

      {/* GRAFICO */}
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
              onClick={() => setChartMode('newAuthors')}
              style={{
                ...styles.switchBtn,
                background: chartMode === 'newAuthors' ? '#4f46e5' : '#eef2ff',
                color: chartMode === 'newAuthors' ? '#fff' : '#4f46e5'
              }}
            >
              Nuovi autori
            </button>
          </div>
        </div>

        <div style={styles.scrollChart}>
          {(chartMode === 'books'
            ? evolutionBase
            : chartMode === 'pages'
            ? evolutionBase
            : evolutionNewAuthors
          ).map(([year, data]) => {
            const value =
              chartMode === 'books'
                ? (data as any).books
                : chartMode === 'pages'
                ? (data as any).pages
                : (data as number)

            const height = (value / maxValue) * 100

            return (
              <div
                key={year}
                style={styles.columnItem}
                onClick={() => setSelectedYear(String(year))}
              >
                <div style={styles.columnWrap}>
                  <div
                    style={{
                      ...styles.columnBar,
                      height: `${height}%`
                    }}
                  />
                </div>

                <div style={styles.columnValue}>
                  {value}
                </div>

                <div style={styles.columnLabel}>{year}</div>
              </div>
            )
          })}
        </div>

        {selectedYear && chartMode === 'newAuthors' && (
          <div style={{ marginTop: 10 }}>
            <p style={styles.kpiLabel}>
              Nuovi autori nel {selectedYear}
            </p>

            <div style={styles.inlineRow}>
              {selectedAuthors.length > 0
                ? selectedAuthors.map((a) => (
                    <span key={a} style={styles.pill}>
                      {a}
                    </span>
                  ))
                : 'Nessuno'}
            </div>
          </div>
        )}
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
        <h3 style={styles.sectionTitle}>
          🏆 Top 5 autori / {totalAuthors}
        </h3>

        {topAuthors.slice(0, 5).map(([author, count], i) => (
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
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  switch: {
    display: 'flex',
    gap: '6px'
  },
  switchBtn: {
    padding: '4px 10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px'
  },
  scrollChart: {
    marginTop: '12px',
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    paddingBottom: '6px'
  },
  columnItem: {
    minWidth: '44px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer'
  },
  columnWrap: {
    height: '110px',
    width: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    background: '#eef2ff',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  columnBar: {
    width: '100%',
    background: 'linear-gradient(180deg, #4f46e5, #7c3aed)',
    borderRadius: '999px',
    transition: 'height 0.3s ease'
  },
  columnValue: {
    fontSize: '10px',
    marginTop: '6px',
    fontWeight: 600,
    color: '#4f46e5'
  },
  columnLabel: {
    fontSize: '10px',
    marginTop: '2px',
    color: '#6b7280'
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