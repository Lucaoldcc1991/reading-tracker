import { useEffect, useState } from 'react'
import { db } from '../db/database'
import { COUNTRIES } from '../utils/countries'

type Book = {
  title: string
  author: string
  genre?: string
  country?: string
  pages: number
  readingYear?: number
  classic?: boolean
  isClassic?: boolean
}

/* ================= PALETTE "SCAFFALE" =================
   Ogni tonalità richiama la costa di un libro diverso.
   Usata sia per le stat card sia come filo conduttore
   (striscia in apertura). */
const SPINES = {
  teal:     { from: '#1B4B43', to: '#0F332D', soft: '#E4EFEC' },
  burgundy: { from: '#7C2D42', to: '#54202F', soft: '#F3E5E7' },
  gold:     { from: '#C08A28', to: '#8F661C', soft: '#F6EEDD' },
  plum:     { from: '#4A3B6B', to: '#332748', soft: '#EBE7F1' }
}

/* Tono neutro grafite-tortora usato per i numeri di classifica,
   così l'oro resta un accento raro e non "invade" tutto. */
const NEUTRAL = { from: '#5B5044', to: '#3C352C', soft: '#E9E3D8' }

const INK = '#2B2118'
const PAPER = '#FBF7F1'
const PAPER_MUTED = '#F3EDE3'

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

  const booksThisYear = readBooks.filter(
    (b) => b.readingYear === currentYear
  )

  const pagesThisYear = booksThisYear.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const isClassic = (b: Book) =>
    b.classic === true || (b as any).isClassic === true

  const classicsThisYear = booksThisYear.filter(isClassic)

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

  const longestThisYear = [...booksThisYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  /* Calcolo generi dell'anno in corso */
  const genreMap: Record<string, number> = {}
  booksThisYear.forEach((b) => {
    if (!b.genre) return
    genreMap[b.genre] = (genreMap[b.genre] || 0) + 1
  })
  const topGenresThisYear = Object.entries(genreMap).sort((a, b) => b[1] - a[1])

  /* Calcolo paesi dell'anno in corso */
  const countryMap: Record<string, number> = {}
  booksThisYear.forEach((b) => {
    if (!b.country) return
    countryMap[b.country] = (countryMap[b.country] || 0) + 1
  })
  const topCountriesThisYear = Object.entries(countryMap).sort((a, b) => b[1] - a[1])

  return (
    <div style={styles.container}>
      {/* Striscia decorativa "scaffale" — firma visiva della home */}
      <div style={styles.shelfStrip}>
        <span style={{ ...styles.shelfBar, background: SPINES.teal.from }} />
        <span style={{ ...styles.shelfBar, background: SPINES.burgundy.from }} />
        <span style={{ ...styles.shelfBar, background: SPINES.gold.from }} />
        <span style={{ ...styles.shelfBar, background: SPINES.plum.from }} />
      </div>

      <h2 style={styles.header}>🏠 Home</h2>
      <p style={styles.eyebrow}>Anno {currentYear}</p>

      <h3 style={styles.sectionTitle}>Letture di quest’anno</h3>

      <div style={styles.grid}>
        <Card title="Libri letti" value={booksThisYear.length} icon="📚" accent={SPINES.teal} />
        <Card title="Pagine lette" value={pagesThisYear} icon="📄" accent={SPINES.burgundy} />
        <Card title="Nuovi autori" value={newAuthorsThisYear.length} icon="✍️" accent={SPINES.gold} />
        <Card title="Classici" value={classicsThisYear.length} icon="🏛️" accent={SPINES.plum} />
      </div>

      <BookCard title="Il libro più lungo" book={longestThisYear} />

      {/* Sezione generi / paesi */}
      <div style={styles.insightCard}>
        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitleSmall}>📚 Libri letti per genere</h3>
          {topGenresThisYear.map(([genre, count], i) => (
            <RankRow
              key={genre}
              rank={i + 1}
              label={genre}
              count={count}
              isLast={i === topGenresThisYear.length - 1}
            />
          ))}
          {topGenresThisYear.length === 0 && <p style={styles.emptyText}>Nessun genere ancora registrato.</p>}
        </div>

        <div style={styles.sectionCard}>
          <h3 style={styles.sectionTitleSmall}>🌍 Libri letti per Paese</h3>
          {topCountriesThisYear.map(([country, count], i) => {
            const c = COUNTRIES.find(x => x.name === country)
            return (
              <RankRow
                key={country}
                rank={i + 1}
                label={`${c?.flag ?? ''} ${country}`}
                count={count}
                isLast={i === topCountriesThisYear.length - 1}
              />
            )
          })}
          {topCountriesThisYear.length === 0 && <p style={styles.emptyText}>Nessun paese ancora registrato.</p>}
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
          <p style={styles.bookPages}>
            {book.pages} pagine
          </p>
        </>
      ) : (
        <p style={styles.emptyText}>Ancora nessun libro registrato quest’anno.</p>
      )}
    </div>
  )
}

/* Riga di classifica pulita: numero d'ordine + etichetta + conteggio,
   senza barre — solo tipografia e un piccolo badge numerico. */
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

  sectionTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: INK,
    marginTop: '8px',
    fontFamily: 'Georgia, "Iowan Old Style", serif'
  },

  sectionTitleSmall: {
    fontSize: '13px',
    fontWeight: 700,
    color: INK,
    margin: '0 0 4px 0'
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

  sectionCard: {
    padding: '14px',
    borderRadius: '16px',
    background: '#fff',
    border: `1px solid ${PAPER_MUTED}`,
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)'
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