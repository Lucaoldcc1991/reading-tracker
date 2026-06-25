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

  const thisYearBooks = readBooks.filter(
    (b) => b.readingYear === currentYear
  )

  const lastYearBooks = readBooks.filter(
    (b) => b.readingYear === previousYear
  )

  const sumPages = (arr: Book[]) =>
    arr.reduce((sum, b) => sum + (b.pages || 0), 0)

  const thisYearPages = sumPages(thisYearBooks)
  const lastYearPages = sumPages(lastYearBooks)

  const newAuthorsThisYear = new Set(
    thisYearBooks.map((b) => b.author)
  )

  const newAuthorsLastYear = new Set(
    lastYearBooks.map((b) => b.author)
  )

  const longestThisYear = [...thisYearBooks].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  const longestLastYear = [...lastYearBooks].sort(
    (a, b) => (b.pages || 0) - (a.pages || 0)
  )[0]

  const classicsThisYear = thisYearBooks.filter(
    (b) => b.isClassic
  )

  const classicsLastYear = lastYearBooks.filter(
    (b) => b.isClassic
  )

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>🏠 Home</h2>
        <div style={styles.yearBadge}>Anno {currentYear}</div>
      </div>

      {/* KPI ANNO CORRENTE */}
      <div style={styles.grid}>
        <Card title="Libri letti" value={thisYearBooks.length} />
        <Card title="Pagine lette" value={thisYearPages} />
        <Card title="Nuovi autori" value={newAuthorsThisYear.size} />
        <Card title="Classici" value={classicsThisYear.length} />
        <Card
          title="Libro più lungo"
          value={
            longestThisYear
              ? `${longestThisYear.title} (${longestThisYear.pages} pagine)`
              : '-'
          }
        />
      </div>

      {/* CONFRONTO ANNO PRECEDENTE */}
      <div style={styles.compareBox}>
        <div style={styles.compareHeader}>
          Confronto con {previousYear}
        </div>

        <div style={styles.compareGrid}>
          <MiniCard
            label="Libri"
            a={thisYearBooks.length}
            b={lastYearBooks.length}
          />
          <MiniCard
            label="Pagine"
            a={thisYearPages}
            b={lastYearPages}
          />
          <MiniCard
            label="Autori"
            a={newAuthorsThisYear.size}
            b={newAuthorsLastYear.size}
          />
          <MiniCard
            label="Classici"
            a={classicsThisYear.length}
            b={classicsLastYear.length}
          />

          <div style={styles.fullRow}>
            <div style={styles.longestLabel}>
              Libro più lungo
            </div>
            <div style={styles.longestValue}>
              {longestThisYear?.title || '-'} <span style={{ opacity: 0.4, margin: '0 6px' }}>/</span> {longestLastYear?.title || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   COMPONENTI
========================= */

function Card({ title, value }: any) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  )
}

function MiniCard({ label, a, b }: any) {
  return (
    <div style={styles.miniCard}>
      <div style={styles.miniLabel}>{label}</div>

      <div style={styles.miniValue}>
        <span>{a}</span>
        <span style={{ opacity: 0.25, margin: '0 6px' }}>/</span>
        <span style={{ opacity: 0.7 }}>{b}</span>
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
    gap: '14px'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  title: {
    fontSize: '22px',
    fontWeight: 700
  },

  yearBadge: {
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '999px',
    background: '#eef2ff',
    color: '#3730a3'
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
    fontSize: '12px',
    color: '#777'
  },

  cardValue: {
    fontSize: '18px',
    fontWeight: 600
  },

  compareBox: {
    marginTop: '10px',
    padding: '14px',
    borderRadius: '12px',
    background: '#f9fafb',
    border: '1px solid #eee'
  },

  compareHeader: {
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '10px',
    color: '#555'
  },

  compareGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },

  miniCard: {
    padding: '10px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid #eee'
  },

  miniLabel: {
    fontSize: '11px',
    color: '#777'
  },

  miniValue: {
    fontSize: '14px',
    fontWeight: 600
  },

  fullRow: {
    gridColumn: '1 / -1',
    padding: '10px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid #eee'
  },

  longestLabel: {
    fontSize: '11px',
    color: '#777'
  },

  longestValue: {
    fontSize: '13px',
    fontWeight: 500
  }
}