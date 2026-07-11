import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/library', label: 'Libri letti', icon: '📚' },
  { to: '/explore', label: 'Esplora', icon: '🧭' },
  { to: '/wishlist', label: 'Wishlist', icon: '✨' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/settings', label: '', icon: '⚙️' }
]

export default function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={styles.nav}>
      {TABS.map(tab => (
        <NavItem
          key={tab.to}
          to={tab.to}
          label={tab.label}
          icon={tab.icon}
          active={isActive(tab.to)}
        />
      ))}
    </nav>
  )
}

function NavItem({
  to,
  label,
  icon,
  active
}: {
  to: string
  label: string
  icon: string
  active: boolean
}) {
  return (
    <Link to={to} style={styles.link}>
      <span
        style={{
          ...styles.iconWrap,
          ...(active ? styles.iconWrapActive : {})
        }}
      >
        {icon}
      </span>
      <span style={{ ...styles.label, ...(active ? styles.labelActive : {}) }}>
        {label}
      </span>
    </Link>
  )
}

/* =========================
   STILI — coerenti con la palette "scaffale"
========================= */

const INK = '#2B2118'
const PAPER_MUTED = '#F3EDE3'
const TEAL = { from: '#1B4B43', to: '#0F332D', soft: '#E4EFEC' }

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 4px calc(8px + env(safe-area-inset-bottom))',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderTop: `1px solid ${PAPER_MUTED}`,
    borderRadius: '20px 20px 0 0',
    boxShadow: '0 -8px 24px rgba(43,33,24,0.08)',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10
  },

  link: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    flex: 1,
    padding: '2px 0'
  },

  iconWrap: {
    fontSize: '17px',
    width: '38px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    opacity: 0.55
  },

  iconWrapActive: {
    background: `linear-gradient(145deg, ${TEAL.from}, ${TEAL.to})`,
    boxShadow: '0 6px 14px rgba(27,75,67,0.3)',
    opacity: 1
  },

  label: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#9C8F7D',
    letterSpacing: '0.2px'
  },

  labelActive: {
    color: INK,
    fontWeight: 700
  }
}