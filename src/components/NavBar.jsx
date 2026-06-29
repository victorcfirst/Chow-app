import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',           label: 'หน้าแรก',  icon: '🏠' },
  { to: '/notes',      label: 'โน้ต',     icon: '📝' },
  { to: '/restaurants', label: 'อาหาร',   icon: '🍽️' },
  { to: '/calendar',   label: 'นัดหมาย',  icon: '📅' },
  { to: '/insurance',  label: 'ประกัน',   icon: '🛡️' },
  { to: '/vehicles',   label: 'รถ',       icon: '🚗' },
]

export default function NavBar() {
  return (
    <nav className="navbar">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
