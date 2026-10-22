import { Link, Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import { CupIcon } from '../components/Icons.jsx'
import { TitleModalProvider } from '../components/TitleModal.jsx'
import './MemberLayout.css'

export default function MemberLayout() {
  return (
    <TitleModalProvider>
      <NavBar />
      <Outlet />
      <Link to="/donate" className="donate-fab" aria-label="Buy us a coffee: donate">
        <CupIcon />
      </Link>
    </TitleModalProvider>
  )
}
