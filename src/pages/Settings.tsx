import { db } from '../db/database'

export default function Settings() {
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

        alert('Backup importato con successo')
      } catch (err) {
        alert('Errore durante l’importazione')
      }
    }

    reader.readAsText(file)
  }

  /* =========================
     RESET DATA (DEV TOOL)
  ========================= */

  const resetAll = async () => {
    const confirmReset = confirm(
      'Sei sicuro? Tutti i dati verranno eliminati.'
    )

    if (!confirmReset) return

    await db.books.clear()
    await db.wishlist.clear()

    alert('Dati eliminati')
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Settings</h2>

      {/* EXPORT */}
      <div style={styles.card}>
        <p style={styles.label}>Backup locale</p>
        <button onClick={exportBackup} style={styles.button}>
          Esporta backup (.json)
        </button>
      </div>

      {/* IMPORT */}
      <div style={styles.card}>
        <p style={styles.label}>Ripristina backup</p>
        <input type="file" onChange={importBackup} />
      </div>

      {/* CLOUD (FUTURO) */}
      <div style={styles.card}>
        <p style={styles.label}>Backup cloud</p>
        <button
          onClick={() => alert('Funzione cloud futura')}
          style={styles.buttonSecondary}
        >
          Backup cloud
        </button>
      </div>

      {/* RESET */}
      <div style={styles.card}>
        <p style={styles.label}>Zona pericolosa</p>
        <button onClick={resetAll} style={styles.danger}>
          Cancella tutti i dati
        </button>
      </div>

      {/* INFO */}
      <div style={styles.card}>
        <p style={styles.label}>Informazioni</p>
        <p style={styles.info}>
          Reading Tracker 2.0 - versione locale Dexie
        </p>
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
    fontSize: '20px',
    fontWeight: 600
  },
  card: {
    padding: '12px',
    border: '1px solid #eee',
    borderRadius: '12px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '13px',
    color: '#666'
  },
  button: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: '#eef2ff',
    fontWeight: 500,
    cursor: 'pointer'
  },
  buttonSecondary: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer'
  },
  danger: {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: '#fee2e2',
    color: '#991b1b',
    fontWeight: 600,
    cursor: 'pointer'
  },
  info: {
    fontSize: '13px',
    color: '#444'
  }
}