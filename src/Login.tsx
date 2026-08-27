import { useState } from 'react'

export default function Login({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const backendUrl = `${apiUrl}/api/admin/login`
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login gagal')
      }

      // Success
      const token = data.token;
      if (!token) throw new Error('Token tidak ditemukan dari server');
      
      localStorage.setItem('adminToken', token)
      onLoginSuccess(token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 selection:bg-[#F3E1E4] selection:text-[#5C4033]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in-up flex flex-col items-center">
          <img src="/logo.png" alt="Iam Brownies Logo" className="h-20 md:h-28 w-auto mb-4 drop-shadow-md" />
          <h1 className="text-[#5C4033] text-4xl font-extrabold tracking-tight mb-2 drop-shadow-sm">
            Iam Brownies
          </h1>
          <p className="text-[#A47B8E] font-medium text-sm tracking-wider italic">
            Admin Portal
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 md:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgb(92,64,51,0.05)] border border-white/60 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-[#5C4033] mb-8 text-center">Masuk ke Dashboard</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-[#F3E1E4]/50 border border-[#D4A5A5] rounded-2xl text-[#5C4033] text-sm text-center font-medium flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4A5A5]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#5C4033] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-[#D4A5A5] outline-none transition-all text-[#5C4033] font-medium placeholder:text-[#A47B8E]/50"
                placeholder="Masukkan email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#5C4033] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 rounded-2xl border-2 border-transparent bg-white/50 focus:bg-white focus:border-[#D4A5A5] outline-none transition-all text-[#5C4033] font-medium placeholder:text-[#A47B8E]/50"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A47B8E] hover:text-[#5C4033] transition-colors focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-[#5C4033] hover:bg-[#4A332A] text-white font-bold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#5C4033]/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
