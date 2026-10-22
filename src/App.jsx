import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './layouts/RequireAuth.jsx'
import MemberLayout from './layouts/MemberLayout.jsx'
import Landing from './pages/Landing.jsx'
import SignIn from './pages/SignIn.jsx'
import MemberHome from './pages/MemberHome.jsx'
import SignOut from './pages/SignOut.jsx'
import Results from './pages/Results.jsx'
import Watch from './pages/Watch.jsx'
import Donate from './pages/Donate.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signout" element={<SignOut />} />
      <Route element={<RequireAuth />}>
        <Route element={<MemberLayout />}>
          <Route path="browse" element={<MemberHome />} />
          <Route path="movies" element={<Results mode="movies" />} />
          <Route path="tv" element={<Results mode="tv" />} />
          <Route path="category/:genre" element={<Results mode="category" />} />
          <Route path="search" element={<Results mode="search" />} />
          <Route path="favorites" element={<Results mode="favorites" />} />
          <Route path="watch/:id" element={<Watch />} />
          <Route path="donate" element={<Donate />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
