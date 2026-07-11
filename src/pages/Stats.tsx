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

/* ================= PALETTE "SCAFFALE" =================
   Stessa palette di Home.tsx, per coerenza visiva tra le pagine. */
const SPINES = {
  teal:     { from: '#1B4B43', to: '#0F332D', soft: '#E4EFEC' },
  burgundy: { from: '#7C2D42', to: '#54202F', soft: '#F3E5E7' },
  gold:     { from: '#C08A28', to: '#8F661C', soft: '#F6EEDD' },
  plum:     { from: '#4A3B6B', to: '#332748', soft: '#EBE7F1' }
}

const INK = '#2B2118'
const PAPER = '#FBF7F1'
const PAPER_MUTED = '#F3EDE3'

/* Tono neutro grafite-tortora per i badge di classifica,
   coerente con la stessa lista usata in Home.tsx. */
const NEUTRAL = { from: '#5B5044', to: '#3C352C', soft: '#E9E3D8' }

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

  const uniqueAuthors = new Set(readBooks.map((b) => b.author)).size

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

  const countryPodiumItems: [string, number][] = countries.slice(0, 3).map(([country, count]) => {
    const c = COUNTRIES.find(x => x.name === country)
    return [`${c?.flag ?? ''} ${country}`, count]
  })

  const chartModes: { key: ChartMode; label: string }[] = [
    { key: 'books', label: 'Libri' },
    { key: 'pages', label: 'Pagine' },
    { key: 'classics', label: 'Classici' },
    { key: 'newAuthors', label: 'Autori scoperti' }
  ]

  return (
    <div style={styles.container}>
      {/* Striscia decorativa "scaffale", coerente con Home */}
      <div style={styles.shelfStrip}>
        <span style={{ ...styles.shelfBar, background: SPINES.teal.from }} />
        <span style={{ ...styles.shelfBar, background: SPINES.burgundy.from }} />
        <span style={{ ...styles.shelfBar, background: SPINES.gold.from }} />
        <span style={{ ...styles.shelfBar, background: SPINES.plum.from }} />
      </div>

      <h2 style={styles.header}>📊 Statistiche</h2>
      <p style={styles.eyebrow}>Panoramica completa</p>

      <div style={styles.grid}>
        <Card title="Libri letti" value={totalBooks} icon="📚" accent={SPINES.teal} />
        <Card title="Pagine lette" value={totalPages} icon="📄" accent={SPINES.burgundy} />
        <Card title="Autori letti" value={uniqueAuthors} icon="✍️" accent={SPINES.gold} />
        <Card title="Classici" value={classicBooks.length} icon="🏛️" accent={SPINES.plum} />
      </div>

      {/* EVOLUZIONE */}
      <div style={styles.sectionCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.sectionTitleSmall}>📈 Evoluzione</h3>

          <div style={styles.switch}>
            {chartModes.map((m) => (
              <button
                key={m.key}
                onClick={() => setChartMode(m.key)}
                style={{
                  ...styles.switchBtn,
                  background: chartMode === m.key ? SPINES.gold.from : PAPER_MUTED,
                  color: chartMode === m.key ? '#fff' : INK
                }}
              >
                {m.label}
              </button>
            ))}
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
            const isHighest = value === maxValue && maxValue > 0

            return (
              <div key={year} style={styles.columnItem}>
                <div style={styles.columnWrap}>
                  <div
                    style={{
                      ...styles.columnBar,
                      height: `${height}%`,
                      background: isHighest
                        ? `linear-gradient(180deg, ${SPINES.gold.from}, ${SPINES.gold.to})`
                        : `linear-gradient(180deg, ${SPINES.teal.from}, ${SPINES.teal.to})`
                    }}
                  />
                </div>

                <div style={styles.columnValue}>{value}</div>
                <div style={styles.columnLabel}>{year}</div>
              </div>
            )
          })}
          {evolutionBase.length === 0 && (
            <p style={styles.emptyText}>Nessun dato ancora registrato.</p>
          )}
        </div>
      </div>

      {/* LIBRO PIÙ LUNGO */}
      <BookCard title="Il libro più lungo" book={longestBook} />

      {/* INSIGHT — classifica dei primi 3 */}
      <div style={styles.insightCard}>
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitleSmall}>✍️ Autori più letti</h3>
          {topAuthors.slice(0, 3).map(([author, count], i, arr) => (
            <RankRow key={author} rank={i + 1} label={author} count={count} isLast={i === arr.length - 1} />
          ))}
          {topAuthors.length === 0 && <p style={styles.emptyText}>Nessun autore ancora registrato.</p>}
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitleSmall}>🌍 Paesi più esplorati</h3>
          {countryPodiumItems.map(([label, count], i, arr) => (
            <RankRow key={label} rank={i + 1} label={label} count={count} isLast={i === arr.length - 1} />
          ))}
          {countryPodiumItems.length === 0 && <p style={styles.emptyText}>Nessun paese ancora registrato.</p>}
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitleSmall}>📚 Generi preferiti</h3>
          {topGenres.slice(0, 3).map(([genre, count], i, arr) => (
            <RankRow key={genre} rank={i + 1} label={genre} count={count} isLast={i === arr.length - 1} />
          ))}
          {topGenres.length === 0 && <p style={styles.emptyText}>Nessun genere ancora registrato.</p>}
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTI ================= */

function Card({
  title,
  value,
  icon,
  accent
}: {
  title: string
  value: any
  icon: string
  accent: { from: string; to: string; soft: string }
}) {
  return (
    <div
      style={{
        ...styles.card,
        background: `linear-gradient(155deg, ${accent.from}, ${accent.to})`
      }}
    >
      <span style={styles.cardIcon}>{icon}</span>
      <p style={styles.cardTitle}>{title}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

function BookCard({
  title,
  book
}: {
  title: string
  book?: any
}) {
  return (
    <div style={styles.bookCard}>
      <span style={styles.bookRibbon}>🏆</span>
      <p style={styles.bookCardTitle}>{title}</p>

      {book ? (
        <>
          <p style={styles.bookTitle}>{book.title}</p>
          <p style={styles.bookAuthor}>{book.author}</p>
          <p style={styles.bookPages}>{book.pages} pagine</p>
        </>
      ) : (
        <p style={styles.emptyText}>Ancora nessun libro registrato.</p>
      )}
    </div>
  )
}

/* Riga di classifica pulita: numero d'ordine + etichetta + conteggio,
   stessa identica identità visiva della lista in Home.tsx. */
function RankRow({
  rank,
  label,
  count,
  isLast
}: {
  rank: number
  label: string
  count: number
  isLast?: boolean
}) {
  return (
    <div style={{ ...styles.rankRow, borderBottom: isLast ? 'none' : `1px solid ${PAPER_MUTED}` }}>
      <span style={styles.rankBadge}>{rank}</span>
      <span style={styles.rankLabel} title={label}>{label}</span>
      <span style={styles.rankCount}>{count}</span>
    </div>
  )
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    background: PAPER,
    padding: '4px 2px 20px'
  },

  shelfStrip: {
    display: 'flex',
    gap: '6px',
    height: '10px',
    borderRadius: '999px',
    overflow: 'hidden'
  },
  shelfBar: {
    flex: 1,
    borderRadius: '999px'
  },

  header: {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    color: INK,
    marginTop: '4px',
    marginBottom: 0,
    letterSpacing: '0.2px'
  },

  eyebrow: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#8A7B68',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    margin: 0
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  card: {
    padding: '16px 14px',
    borderRadius: '18px',
    color: '#fff',
    boxShadow: '0 10px 22px rgba(43,33,24,0.18)',
    position: 'relative',
    overflow: 'hidden'
  },

  cardIcon: {
    fontSize: '16px',
    opacity: 0.9
  },

  cardTitle: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.85)',
    marginTop: '6px',
    marginBottom: '2px'
  },

  cardValue: {
    fontSize: '22px',
    fontWeight: 800,
    margin: 0
  },

  sectionCard: {
    padding: '14px',
    borderRadius: '16px',
    background: '#fff',
    border: `1px solid ${PAPER_MUTED}`,
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)'
  },

  sectionTitleSmall: {
    fontSize: '13px',
    fontWeight: 700,
    color: INK,
    margin: 0
  },

  chartHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '12px'
  },

  switch: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },

  switchBtn: {
    padding: '5px 10px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 600
  },

  scrollChart: {
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    paddingBottom: '2px'
  },

  columnItem: {
    minWidth: '44px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  columnWrap: {
    height: '110px',
    width: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    background: PAPER_MUTED,
    borderRadius: '999px'
  },

  columnBar: {
    width: '100%',
    borderRadius: '999px'
  },

  columnValue: {
    fontSize: '10px',
    marginTop: '6px',
    color: INK,
    fontWeight: 600
  },

  columnLabel: {
    fontSize: '10px',
    color: '#8A7B68'
  },

  bookCard: {
    padding: '16px',
    borderRadius: '16px',
    border: `1px solid ${SPINES.gold.soft}`,
    background: `linear-gradient(180deg, #fff, ${PAPER_MUTED})`,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: '0 6px 16px rgba(43,33,24,0.08)',
    position: 'relative'
  },

  bookRibbon: {
    position: 'absolute',
    top: '-8px',
    right: '14px',
    fontSize: '20px',
    filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.15))'
  },

  bookCardTitle: {
    fontSize: '12px',
    color: '#8A7B68',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    margin: 0
  },

  bookTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: INK,
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    marginTop: '2px'
  },

  bookAuthor: {
    fontSize: '13px',
    color: '#5C4E3D'
  },

  bookPages: {
    fontSize: '12px',
    color: '#8A7B68'
  },

  insightCard: {
    padding: '4px',
    borderRadius: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  rankRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 0'
  },

  rankBadge: {
    width: '22px',
    height: '22px',
    flexShrink: 0,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
    background: `linear-gradient(155deg, ${NEUTRAL.from}, ${NEUTRAL.to})`
  },

  rankLabel: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 600,
    color: INK,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  rankCount: {
    fontSize: '14px',
    fontWeight: 800,
    color: NEUTRAL.from,
    minWidth: '18px',
    textAlign: 'right'
  },

  emptyText: {
    fontSize: '13px',
    color: '#8A7B68',
    fontStyle: 'italic',
    margin: 0
  }
}
