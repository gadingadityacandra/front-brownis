import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminApp from './AdminApp'
import MessageView from './MessageView'
import Login from './Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        // Decode JWT payload dan cek expiry
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          // Token expired → paksa logout
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminEmail');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch {
        // Token rusak/tidak valid → paksa logout
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsChecking(false);
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
              <AdminApp 
                onLogout={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminEmail');
                  setIsAuthenticated(false);
                }}
                onSessionExpired={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminEmail');
                  setIsAuthenticated(false);
                  alert('Sesi Anda telah berakhir. Silakan login kembali.');
                }}
              /> : 
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
