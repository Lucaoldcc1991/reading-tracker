import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  pages: number
  readingYear?: number
  isClassic?: boolean
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])
  const [toast, setToast] = useState<string | null>(null)

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

  const authorsPreviousYears = new Set(
    readBooks
      .filter((b) => b.readingYear && b.readingYear < currentYear)
      .map((b) => b.author)
  )

  const newAuthorsThisYear = [...authorsThisYear].filter(
    (a) => !authorsPreviousYears.has(a)
  )

  const classicThisYear = booksThisYear.filter(
    (b) => b.isClassic
  )

  const longestThisYear = [...booksThisYear].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  /* TOAST LOGIC */
  useEffect(() => {
    const booksKey = 'rt_books_notified'
    const pagesKey = 'rt_pages_notified'

    const booksNotified = localStorage.getItem(booksKey)
    const pagesNotified = localStorage.getItem(pagesKey)

    if (booksThisYear.length > booksLastYear.length && !booksNotified) {
      setToast('🎉 Libri superati rispetto all’anno scorso')
      localStorage.setItem(booksKey, 'true')
      setTimeout(() => setToast(null), 3000)
    }

    if (pagesThisYear > pagesLastYear && !pagesNotified) {
      setTimeout(() => {
        setToast('📚 Pagine superate rispetto all’anno scorso')
        localStorage.setItem(pagesKey, 'true')
        setTimeout(() => setToast(null), 3000)
      }, 3000)
    }
  }, [booksThisYear.length, pagesThisYear, pagesLastYear])

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏠 Home</h2>

      {toast && <div style={styles.toast}>{toast}</div>}

      {/* KPI PRIMARY */}
      <div style={styles.grid}>
        <Card label="Libri anno" value={booksThisYear.length} icon="📚" />
        <Card label="Pagine anno" value={pagesThisYear} icon="📄" />
        <Card label="Nuovi autori" value={newAuthorsThisYear.length} icon="👤" />
        <Card label="Classici" value={classicThisYear.length} icon="🏛️" />
      </div>

      {/* FEATURE BOOK */}
      <div style={styles.featureCard}>
        <p style={styles.sectionLabel}>Libro più lungo dell’anno</p>

        {longestThisYear ? (
          <>
            <p style={styles.featureTitle}>
              {longestThisYear.title}
            </p>

            <p style={styles.featureSub}>
              {longestThisYear.author}
            </p>

            <p style={styles.featureMeta}>
              {longestThisYear.pages} pagine
            </p>
          </>
        ) : (
          <p style={styles.featureMeta}>-</p>
        )}
      </div>

      {/* COMPARISON */}
      <div style={styles.compare}>
        <p style={styles.sectionLabel}>Confronto anno precedente</p>

        <Row icon="📚" label="Libri" value={`${booksThisYear.length} vs ${booksLastYear.length}`} />
        <Row icon="📄" label="Pagine" value={`${pagesThisYear} vs ${pagesLastYear}`} />
        <Row icon="👤" label="Autori nuovi" value={newAuthorsThisYear.length} />
        <Row icon="🏛️" label="Classici" value={classicThisYear.length} />
      </div>
    </div>
  )
}

/* COMPONENTI */

function Card({
  label,
  value,
  icon
}: {
  label: string
  value: any
  icon: string
}) {
  return (
    <div style={styles.card}>
      <div style={styles.icon}>{icon}</div>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  )
}

function Row({
  icon,
  label,
  value
}: {
  icon: string
  label: string
  value: any
}) {
  return (
    <div style={styles.row}>
      <span>{icon} {label}</span>
      <span>{value}</span>
    </div>
  )
}

/* STILI */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  title: {
    fontSize: '22px',
    fontWeight: 700
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  card: {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid #eee',
    background: '#fff'
  },

  icon: {
    fontSize: '18px',
    marginBottom: '6px'
  },

  cardLabel: {
    fontSize: '12px',
    color: '#777'
  },

  cardValue: {
    fontSize: '18px',
    fontWeight: 700
  },

  featureCard: {
    padding: '16px',
    borderRadius: '16px',
    background: '#f9fafb',
    border: '1px solid #eee'
  },

  sectionLabel: {
    fontSize: '12px',
    color: '#777',
    marginBottom: '6px'
  },

  featureTitle: {
    fontSize: '16px',
    fontWeight: 700
  },

  featureSub: {
    fontSize: '14px',
    color: '#444'
  },

  featureMeta: {
    fontSize: '12px',
    color: '#888'
  },

  compare: {
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid #eee',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#444'
  },

  toast: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111827',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    zIndex: 9999
  }
}