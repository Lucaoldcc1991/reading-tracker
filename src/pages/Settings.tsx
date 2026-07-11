// Settings.tsx
import { useState } from 'react'
import { db } from '../db/database'

/* ================= PALETTE "SCAFFALE" =================
   Stessa identità visiva delle altre schermate. */
const INK = '#2B2118'
const PAPER = '#FBF7F1'
const PAPER_MUTED = '#F3EDE3'

const TEAL     = { from: '#1B4B43', to: '#0F332D', soft: '#E4EFEC' }
const GOLD     = { from: '#C08A28', to: '#8F661C', soft: '#F6EEDD' }
const BURGUNDY = { from: '#7C2D42', to: '#54202F', soft: '#F3E5E7' }

export default function Settings() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  /* =========================
     EXPORT BACKUP
  ========================= */

  const exportBackup = async () => {
    const books = await db.books.toArray()
    const wishlist = await db.wishlist.toArray()

    const data = {
      books,
      wishlist,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `ReadingTracker_Backup_${new Date()
      .toISOString()
      .split('T')[0]}.json`

    a.click()

    URL.revokeObjectURL(url)
  }

  /* =========================
     IMPORT BACKUP
  ========================= */

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setImportStatus('idle')

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string
        const data = JSON.parse(result)

        if (data.books) {
          await db.books.clear()
          await db.books.bulkAdd(data.books)
        }

        if (data.wishlist) {
          await db.wishlist.clear()
          await db.wishlist.bulkAdd(data.wishlist)
        }

        setImportStatus('success')
      } catch (err) {
        setImportStatus('error')
      }
    }

    reader.readAsText(file)
  }

  /* =========================
     RESET BOOKS
  ========================= */

  const resetBooks = async () => {
    const confirmReset = confirm(
      'Vuoi eliminare tutti i libri? Questa azione non può essere annullata.'
    )

    if (!confirmReset) return

    await db.books.clear()

    alert('Tutti i libri sono stati eliminati')
  }

  return (
    <div style={styles.container}>
      <style>{`
        .rt-file-input::file-selector-button {
          padding: 8px 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(145deg, ${TEAL.from}, ${TEAL.to});
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          margin-right: 12px;
        }
      `}</style>

      <div style={styles.header}>
        <span style={styles.headerIcon}>⚙️</span>
        <div>
          <h2 style={styles.title}>Impostazioni</h2>
          <p style={styles.subtitle}>Backup, ripristino e gestione dati</p>
        </div>
      </div>

      {/* EXPORT */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <span style={{ ...styles.cardIcon, background: TEAL.soft, color: TEAL.from }}>⬇️</span>
          <div>
            <p style={styles.cardLabel}>Backup locale</p>
            <p style={styles.cardHint}>Salva una copia di libri e wishlist in un file .json</p>
          </div>
        </div>
        <button onClick={exportBackup} style={styles.buttonPrimary}>
          Esporta backup
        </button>
      </div>

      {/* IMPORT */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <span style={{ ...styles.cardIcon, background: GOLD.soft, color: GOLD.from }}>⬆️</span>
          <div>
            <p style={styles.cardLabel}>Ripristina backup</p>
            <p style={styles.cardHint}>Carica un file .json esportato in precedenza</p>
          </div>
        </div>

        <input
          type="file"
          accept="application/json"
          onChange={importBackup}
          className="rt-file-input"
          style={styles.fileInput}
        />

        {fileName && importStatus === 'success' && (
          <p style={styles.successText}>✓ “{fileName}” importato con successo</p>
        )}
        {fileName && importStatus === 'error' && (
          <p style={styles.errorText}>⚠ Errore durante l’importazione di “{fileName}”</p>
        )}
      </div>

      {/* CLOUD */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <span style={{ ...styles.cardIcon, background: PAPER_MUTED, color: '#8A7B68' }}>☁️</span>
          <div>
            <p style={styles.cardLabel}>Backup cloud</p>
            <p style={styles.cardHint}>Sincronizzazione automatica — in arrivo</p>
          </div>
        </div>
        <button
          onClick={() => alert('Funzione cloud futura')}
          style={styles.buttonSecondary}
        >
          Backup cloud
        </button>
      </div>

      {/* RESET LIBRI */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <span style={{ ...styles.cardIcon, background: BURGUNDY.soft, color: BURGUNDY.from }}>🗑️</span>
          <div>
            <p style={styles.cardLabel}>Reset libreria</p>
            <p style={styles.cardHint}>Elimina definitivamente tutti i libri salvati</p>
          </div>
        </div>
        <button onClick={resetBooks} style={styles.buttonDanger}>
          Elimina tutti i libri
        </button>
      </div>

      {/* INFO */}
      <div style={styles.footerCard}>
        <p style={styles.footerText}>📚 Reading Tracker 2.0</p>
        <p style={styles.footerSub}>Versione locale · dati salvati su questo dispositivo (Dexie)</p>
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
    gap: '14px',
    background: PAPER,
    padding: '4px 2px 24px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px'
  },
  headerIcon: {
    fontSize: '26px'
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: 'Georgia, "Iowan Old Style", serif',
    color: INK,
    margin: 0
  },
  subtitle: {
    fontSize: '12px',
    color: '#8A7B68',
    margin: '2px 0 0'
  },
  card: {
    padding: '16px',
    borderRadius: '16px',
    border: `1px solid ${PAPER_MUTED}`,
    background: '#fff',
    boxShadow: '0 4px 12px rgba(43,33,24,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  cardHead: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  cardIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0
  },
  cardLabel: {
    fontSize: '14px',
    fontWeight: 700,
    color: INK,
    margin: 0
  },
  cardHint: {
    fontSize: '12px',
    color: '#8A7B68',
    margin: '2px 0 0'
  },
  buttonPrimary: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: `linear-gradient(145deg, ${TEAL.from}, ${TEAL.to})`,
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(27,75,67,0.25)',
    alignSelf: 'flex-start'
  },
  buttonSecondary: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${PAPER_MUTED}`,
    background: '#fff',
    color: INK,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  buttonDanger: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: BURGUNDY.soft,
    color: BURGUNDY.from,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  fileInput: {
    fontSize: '12px',
    color: '#5C4E3D',
    padding: '4px 0'
  },
  successText: {
    fontSize: '12px',
    color: '#1B7A4A',
    margin: 0,
    fontWeight: 600
  },
  errorText: {
    fontSize: '12px',
    color: '#B91C1C',
    margin: 0,
    fontWeight: 600
  },
  footerCard: {
    padding: '14px 16px',
    borderRadius: '14px',
    background: PAPER_MUTED,
    textAlign: 'center'
  },
  footerText: {
    fontSize: '13px',
    fontWeight: 700,
    color: INK,
    margin: 0
  },
  footerSub: {
    fontSize: '11px',
    color: '#8A7B68',
    margin: '2px 0 0'
  }
}