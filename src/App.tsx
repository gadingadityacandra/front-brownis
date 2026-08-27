import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminApp from './AdminApp'
import MessageView from './MessageView'
import Login from './Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const authStatus = !!localStorage.getItem('adminToken')
    setIsAuthenticated(authStatus)
    setIsChecking(false)
  }, [])

  if (isChecking) return null

  return (
    <Router>
      <Routes>
        {/* Halaman Admin (Protected) */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <AdminApp onLogout={() => {
                localStorage.removeItem('adminToken');
                setIsAuthenticated(false);
              }} /> : 
              <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          } 
        />
        
        {/* Halaman Publik (Hasil Scan QR) */}
        <Route path="/pesan/:id" element={<MessageView />} />
      </Routes>
    </Router>
  )
}

export default App
