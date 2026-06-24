import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Library from './pages/Library'
import Wishlist from './pages/Wishlist'
import Stats from './pages/Stats'
import Settings from './pages/Settings'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return (
      <div style={styles.splash}>
        <div style={styles.content}>
          <div style={styles.icon}>📚</div>
          <h1 style={styles.title}>Reading Tracker</h1>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navbar />

        <div style={styles.contentArea}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

/* =========================
   STILI SPLASH
========================= */

const styles: Record<string, React.CSSProperties> = {
  splash: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },

  icon: {
    fontSize: '48px'
  },

  title: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: 600,
    letterSpacing: '0.5px'
  },

  /* =========================
     APP LAYOUT (NUOVO)
  ========================= */

  app: {
    minHeight: '100vh',
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column'
  },

  contentArea: {
    flex: 1,
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    padding: '16px 14px 90px 14px'
  }
}