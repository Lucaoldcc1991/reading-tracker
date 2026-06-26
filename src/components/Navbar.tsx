import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <NavItem to="/" label="Home" active={isActive('/')} />
      <NavItem to="/library" label="Libreria" active={isActive('/library')} />
      <NavItem to="/explore" label="Esplora" active={isActive('/explore')} />
      <NavItem to="/wishlist" label="Wishlist" active={isActive('/wishlist')} />
      <NavItem to="/stats" label="Stats" active={isActive('/stats')} />
      <NavItem to="/settings" label="Settings" active={isActive('/settings')} />
    </nav>
  )
}

function NavItem({
  to,
  label,
  active
}: {
  to: string
  label: string
  active: boolean
}) {
  return (
    <Link to={to} style={{ ...styles.link, ...(active ? styles.active : {}) }}>
      {label}
    </Link>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '14px 10px',
    borderBottom: '1px solid #eee',
    background: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },

  link: {
    textDecoration: 'none',
    color: '#777',
    fontSize: '14px',
    fontWeight: 500,
    padding: '6px 10px',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },

  active: {
    color: '#1e66ff',
    background: '#eef4ff'
  }
}