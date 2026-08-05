import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'

interface MessageData {
  id: string
  recipient: string
  sender: string
  message: string
  media_type: 'video' | 'image' | 'youtube'
  media_url: string | null
  created_at: string
}

const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

export default function MessageView() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<MessageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Animation states
  const [isOpened, setIsOpened] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        const backendUrl = `${apiUrl}/api/messages/${id}`;
        const response = await fetch(backendUrl)
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Pesan tidak ditemukan')
        }
        
        setData(result.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchMessage()
  }, [id])

  const handleOpenGift = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);
    
    // Ledakan Confetti!
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#5C4033', '#8B5A2B', '#D4A5A5', '#F3E1E4', '#A47B8E'],
      zIndex: 100
    });
    
    // Wait for animation to finish before showing actual message
    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
    }, 700); 
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="relative flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5C4033]"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-[0_15px_40px_rgb(92,64,51,0.05)] text-center border border-[#F3E1E4] max-w-sm w-full animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#D4A5A5] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-[#5C4033] font-bold text-xl mb-2">Oops!</p>
          <p className="text-[#A47B8E]">{error || 'Pesan kado tidak ditemukan'}</p>
        </div>
      </div>
    )
  }

  // === Gift Opening Screen ===
  if (!isOpened) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center overflow-hidden relative selection:bg-transparent cursor-pointer" onClick={handleOpenGift}>
        
        {/* Floating background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F3E1E4] opacity-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E6D0D4] opacity-30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className={`z-10 flex flex-col items-center transition-all ${isOpening ? 'animate-gift-open-out' : 'animate-gift-bounce'}`}>
          <div className="relative">
            {/* SVG Gift Box Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-40 h-40 text-[#5C4033] drop-shadow-2xl">
              <path d="M9.375 3a1.875 1.875 0 000 3.75h1.875v4.5H3.375A1.875 1.875 0 011.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0112 2.753a3.375 3.375 0 015.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 10-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3zM11.25 12.75H3v6.75a2.25 2.25 0 002.25 2.25h6v-9zM12.75 12.75v9h6a2.25 2.25 0 002.25-2.25v-6.75h-8.25z" />
            </svg>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/20 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2 -z-10"></div>
          </div>
          
          <div className="mt-8 text-center bg-white/70 backdrop-blur-md px-8 py-4 rounded-[2rem] shadow-sm border border-white">
            <h2 className="text-2xl font-extrabold text-[#5C4033] mb-1">Ada Sesuatu Buat Kamu!</h2>
            <p className="text-[#A47B8E] font-medium text-sm animate-pulse">Ketuk untuk membuka</p>
          </div>
        </div>
      </div>
    )
  }

  // === The Main Message Screen (After Opening) ===
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-sans p-4 md:p-8 flex flex-col items-center selection:bg-[#F3E1E4] selection:text-[#5C4033]">
      
      <main className="w-full max-w-2xl mx-auto animate-fade-in-up flex-1 flex flex-col justify-center py-8">
        
        {/* Floating Header */}
        <header className="bg-white/80 backdrop-blur-md text-[#5C4033] p-6 rounded-[2rem] mb-6 shadow-sm border border-white text-center">
          <div className="w-12 h-12 bg-[#F3E1E4] text-[#5C4033] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-[#5C4033]">
            Halo, {data.recipient}!
          </h1>
          <p className="text-[#A47B8E] font-medium text-sm">
            Ini pesan dan hadiah spesial untukmu
          </p>
        </header>

        {/* Message Card */}
        <div className="glass-card p-6 md:p-10 rounded-[2.5rem] shadow-[0_15px_40px_rgb(92,64,51,0.05)] border border-white/60 mb-6 relative overflow-hidden">
          
          {/* Subtle decoration inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3E1E4] opacity-30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <p className="text-[#5C4033] text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
              "{data.message}"
            </p>
            
            <div className="mt-8 text-right flex flex-col items-end">
              <p className="text-[#A47B8E] text-sm font-medium mb-0.5">Dari:</p>
              <p className="text-[#8B5A2B] font-bold text-xl">{data.sender}</p>
            </div>
          </div>
        </div>

        {/* Media Card */}
        {data.media_url && (
          <div className="glass-card p-4 md:p-6 rounded-[2.5rem] shadow-[0_15px_40px_rgb(92,64,51,0.05)] border border-white/60 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs font-bold text-[#A47B8E] uppercase tracking-widest bg-[#F3E1E4]/50 px-4 py-1.5 rounded-full">
                Media Spesial
              </span>
            </div>

            {data.media_type === 'image' && (
              <div className="relative rounded-[1.5rem] overflow-hidden w-full mx-auto border border-[#F3E1E4]">
                <img 
                  src={data.media_url} 
                  alt="Special Gift" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}

            {data.media_type === 'video' && (
              <div className="relative rounded-[1.5rem] overflow-hidden bg-black aspect-[9/16] w-full max-w-[350px] mx-auto shadow-md border border-gray-100">
                <video 
                  src={data.media_url} 
                  controls 
                  className="w-full h-full object-cover"
                  playsInline
                />
              </div>
            )}

            {data.media_type === 'youtube' && (
              <div className="relative rounded-[1.5rem] overflow-hidden w-full mx-auto aspect-video shadow-md border border-gray-100 bg-gray-50">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={getYoutubeEmbedUrl(data.media_url) || data.media_url} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}
            
          </div>
        )}

      </main>

      {/* Divider */}
      <div className="w-full max-w-md mx-auto px-8 mb-8 opacity-50 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4A5A5] to-transparent"></div>
      </div>

      {/* Slogan & Branding */}
      <footer className="text-center pb-10 animate-fade-in-up flex flex-col items-center justify-center w-full" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-[#5C4033] text-2xl md:text-3xl font-extrabold tracking-tight mb-1 opacity-90 drop-shadow-sm">
          Iam Brownies
        </h2>
        <div className="inline-block mb-6">
          <p className="text-[#A47B8E] font-medium text-xs md:text-sm tracking-wider italic animate-typing pr-1">
            Jadi Makin Sayang
          </p>
        </div>

        {/* Social Contacts */}
        <div className="flex items-center justify-center gap-6 text-[#A47B8E]">
          {/* WhatsApp */}
          <a href="#" aria-label="WhatsApp" className="hover:text-[#25D366] transition-colors transform hover:scale-110">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.007 2C6.48 2 2 6.48 2 12.008c0 1.756.455 3.411 1.272 4.856L2 22l5.253-1.238A9.957 9.957 0 0012.007 22c5.527 0 10.007-4.48 10.007-10.007S17.534 2 12.007 2zM17.06 14.86c-.274.773-1.573 1.488-2.185 1.547-.611.059-1.282.176-3.32-1.002-2.038-1.178-3.411-3.235-3.529-3.411-.118-.177-.825-1.12-.825-2.122 0-1.002.522-1.493.714-1.728.192-.236.417-.294.557-.294.14 0 .28.001.404.007.13.006.31-.05.485.372.182.441.603 1.474.655 1.58.053.106.088.23.018.371-.07.142-.106.23-.212.35-.106.117-.225.26-.317.348-.106.106-.217.218-.1.424.118.206.526.87 1.127 1.41.776.697 1.433.914 1.633 1.02.2.106.318.089.435-.047.118-.136.505-.591.643-.79.138-.198.275-.164.455-.098.182.065 1.157.545 1.354.643.197.098.328.147.377.23.048.082.048.472-.226 1.245z" clipRule="evenodd" />
            </svg>
          </a>
          
          {/* Instagram */}
          <a href="https://www.instagram.com/iam.browniesss" aria-label="Instagram" className="hover:text-[#E1306C] transition-colors transform hover:scale-110">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
          </a>

          {/* TikTok */}
          <a href="https://www.tiktok.com/@iam.browniesss_" aria-label="TikTok" className="hover:text-black transition-colors transform hover:scale-110">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.65a6.33 6.33 0 006.33 6.35 6.33 6.33 0 006.33-6.33V9.22a8.21 8.21 0 004.83 1.58V7.3a4.74 4.74 0 01-2.9-.61z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}
