import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface MessageData {
  id: string
  recipient: string
  sender: string
  message: string
  media_type: 'video' | 'image' | 'youtube'
  media_url: string | null
  auto_delete: boolean
  created_at: string
}

export default function AdminApp({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create')
  
  // States for Create
  const [recipient, setRecipient] = useState('')
  const [sender, setSender] = useState('')
  const [message, setMessage] = useState('')
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'youtube'>('video')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [autoDelete, setAutoDelete] = useState(true)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrCodeRecipient, setQrCodeRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // States for List
  const [messagesList, setMessagesList] = useState<MessageData[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Temporary edit states
  const [editRecipient, setEditRecipient] = useState('')
  const [editSender, setEditSender] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [editAutoDelete, setEditAutoDelete] = useState(true)
  
  // Media edit states
  const [editChangeMedia, setEditChangeMedia] = useState(false)
  const [editMediaType, setEditMediaType] = useState<'video' | 'image' | 'youtube'>('video')
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null)
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('')

  // Fetch all messages when switching to list tab
  useEffect(() => {
    if (activeTab === 'list') {
      fetchMessagesList()
    }
  }, [activeTab])

  const fetchMessagesList = async () => {
    setIsLoadingList(true)
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/messages`)
      const result = await response.json()
      if (response.ok) {
        setMessagesList(result.data || [])
      } else {
        alert(result.error || 'Gagal mengambil data')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingList(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('recipient', recipient)
      formData.append('sender', sender)
      formData.append('message', message)
      formData.append('media_type', mediaType)
      formData.append('auto_delete', autoDelete.toString())
      
      if ((mediaType === 'video' || mediaType === 'image') && mediaFile) {
        formData.append('media_file', mediaFile)
      } else if (mediaType === 'youtube' && youtubeUrl) {
        formData.append('media_link', youtubeUrl)
      }

      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const backendUrl = `${apiUrl}/api/messages`;
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }
      
      const newId = result.data.id;
      const publicUrl = `${window.location.origin}/pesan/${newId}`; 
      
      setQrCodeData(publicUrl);
      setQrCodeRecipient(recipient);
      
      // Reset form
      setRecipient('')
      setSender('')
      setMessage('')
      setMediaFile(null)
      setYoutubeUrl('')
      setAutoDelete(true)
      
      alert('Berhasil menyimpan pesanan!');
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Gagal menyimpan data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini? File media juga akan dihapus dari server.')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/messages/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        alert('Berhasil dihapus!')
        fetchMessagesList()
      } else {
        const result = await response.json()
        alert(result.error || 'Gagal menghapus')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan jaringan')
    }
  }

  const startEdit = (msg: MessageData) => {
    setEditingId(msg.id)
    setEditRecipient(msg.recipient)
    setEditSender(msg.sender)
    setEditMessage(msg.message)
    setEditAutoDelete(msg.auto_delete)
    setEditChangeMedia(false)
    setEditMediaType('video')
    setEditMediaFile(null)
    setEditYoutubeUrl('')
  }

  const saveEdit = async (id: string) => {
    try {
      const formData = new FormData()
      formData.append('recipient', editRecipient)
      formData.append('sender', editSender)
      formData.append('message', editMessage)
      formData.append('auto_delete', editAutoDelete.toString())

      if (editChangeMedia) {
        formData.append('media_type', editMediaType)
        if ((editMediaType === 'video' || editMediaType === 'image') && editMediaFile) {
          formData.append('media_file', editMediaFile)
        } else if (editMediaType === 'youtube' && editYoutubeUrl) {
          formData.append('media_link', editYoutubeUrl)
        } else {
          alert('File media atau link YouTube wajib diisi jika opsi ganti media diaktifkan!')
          return
        }
      }

      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      const response = await fetch(`${apiUrl}/api/messages/${id}`, {
        method: 'PUT',
        body: formData
      })
      if (response.ok) {
        alert('Perubahan berhasil disimpan!')
        setEditingId(null)
        fetchMessagesList()
      } else {
        const result = await response.json()
        alert(result.error || 'Gagal menyimpan perubahan')
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan jaringan')
    }
  }

  const showQRForExisting = (id: string, rec: string) => {
    const publicUrl = `${window.location.origin}/pesan/${id}`;
    setQrCodeData(publicUrl);
    setQrCodeRecipient(rec);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-Kado-${qrCodeRecipient}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        
        <header className="bg-white/70 backdrop-blur-md text-[#5C4033] p-6 rounded-3xl mb-8 shadow-sm border border-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-[#A47B8E] font-medium text-sm">iam Brownies • jadi makin sayang </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#F3E1E4]/50 p-1 rounded-full shadow-inner flex-wrap justify-center">
              <button 
                onClick={() => setActiveTab('create')}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === 'create' ? 'bg-white text-[#5C4033] shadow-sm' : 'text-[#A47B8E] hover:text-[#5C4033]'}`}
              >
                Buat Pesanan Baru
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${activeTab === 'list' ? 'bg-white text-[#5C4033] shadow-sm' : 'text-[#A47B8E] hover:text-[#5C4033]'}`}
              >
                Daftar Pesanan
              </button>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar"
                className="p-2.5 rounded-full bg-white text-[#A47B8E] hover:text-[#E1306C] hover:bg-[#F3E1E4] shadow-sm transition-colors border border-white/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={`col-span-1 ${qrCodeData ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
              <div className="glass-card p-6 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgb(92,64,51,0.05)] border border-white/60">
                <h2 className="text-xl font-bold text-[#5C4033] mb-8">Form Gift Spesial</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#8B5A2B] mb-1.5 ml-1">Nama Penerima</label>
                      <input 
                        type="text" 
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-[#F3E1E4] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent transition-all shadow-sm"
                        placeholder="Contoh: Gading Ganteng"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#8B5A2B] mb-1.5 ml-1">Dari Siapa?</label>
                      <input 
                        type="text" 
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        required
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-[#F3E1E4] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent transition-all shadow-sm"
                        placeholder="Contoh: Someone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#8B5A2B] mb-1.5 ml-1">Pesan Ucapan</label>
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-[#F3E1E4] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent transition-all shadow-sm resize-none"
                        placeholder="Tuliskan ucapan termanis di sini..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#F3E1E4]">
                    <label className="block text-sm font-semibold text-[#8B5A2B] mb-3">Tipe Media (Opsional)</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {['video', 'image', 'youtube'].map((type) => (
                        <label key={type} className={`cursor-pointer rounded-xl p-3 text-center border-2 transition-all ${mediaType === type ? 'border-[#D4A5A5] bg-white shadow-sm' : 'border-transparent bg-[#F3E1E4]/30 hover:bg-[#F3E1E4]/50'}`}>
                          <input 
                            type="radio" 
                            name="mediaType" 
                            value={type} 
                            checked={mediaType === type} 
                            onChange={() => setMediaType(type as any)} 
                            className="hidden" 
                          />
                          <span className={`text-sm font-medium capitalize ${mediaType === type ? 'text-[#5C4033]' : 'text-[#A47B8E]'}`}>
                            {type === 'image' ? 'Gambar' : type === 'youtube' ? 'Link / URL' : type}
                          </span>
                        </label>
                      ))}
                    </div>

                    {(mediaType === 'video' || mediaType === 'image') && (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4A5A5] rounded-2xl p-6 bg-white transition-all hover:bg-[#FDFBF7]">
                        <label className="cursor-pointer flex flex-col items-center">
                          <svg className="w-8 h-8 text-[#A47B8E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          <span className="text-sm font-semibold text-[#5C4033]">Klik untuk memilih file</span>
                          <span className="text-xs text-gray-400 mt-1">Maks 50MB</span>
                          <input 
                            type="file" 
                            accept={mediaType === 'video' ? "video/*" : "image/*"} 
                            onChange={(e) => setMediaFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden" 
                          />
                        </label>
                        {mediaFile && (
                          <div className="mt-3 px-3 py-1 bg-[#F3E1E4] rounded-full text-xs font-medium text-[#5C4033] max-w-[200px] truncate">
                            {mediaFile.name}
                          </div>
                        )}
                      </div>
                    )}

                    {mediaType === 'youtube' && (
                      <input 
                        type="url" 
                        placeholder="Masukkan link (YouTube, TikTok, Drive, dll)..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl bg-white border border-[#D4A5A5] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] transition-all text-sm"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#F3E1E4] shadow-sm">
                    <div>
                      <h3 className="text-[#5C4033] font-bold text-sm">Hapus Otomatis (7 Hari)</h3>
                      <p className="text-xs text-[#A47B8E] mt-1">Jika aktif, pesan akan otomatis terhapus setelah 7 hari untuk menghemat penyimpanan.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={autoDelete}
                        onChange={() => setAutoDelete(!autoDelete)}
                      />
                      <div className="w-11 h-6 bg-[#F3E1E4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A5A5]"></div>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#5C4033] hover:bg-[#4A332A] text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#5C4033]/20 flex justify-center items-center disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isLoading ? 'Menyimpan & Mengunggah...' : 'Buat Pesanan Kado'}
                  </button>

                </form>
              </div>
            </div>
            
            {qrCodeData && (
              <div className="col-span-1 lg:col-span-4 animate-fade-in-up">
                <div className="glass-card p-6 rounded-[2rem] shadow-[0_15px_40px_rgb(92,64,51,0.05)] border border-white/60 text-center sticky top-8">
                  <div className="w-12 h-12 bg-[#F3E1E4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#5C4033]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#5C4033] mb-1">Berhasil!</h3>
                  <p className="text-sm text-[#A47B8E] mb-6">QR Code untuk {qrCodeRecipient}</p>
                  
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-[#F3E1E4] mb-6">
                     <QRCodeSVG 
                       id="qr-code-svg"
                       value={qrCodeData} 
                       size={200}
                       bgColor={"#ffffff"}
                       fgColor={"#5C4033"}
                       level={"H"}
                     />
                  </div>
                  
                  <button onClick={downloadQR} className="w-full bg-[#F3E1E4] text-[#5C4033] py-3 rounded-xl font-bold hover:bg-[#D4A5A5] hover:text-white transition-all shadow-sm">
                    Download QR Code
                  </button>
                  <a href={qrCodeData} target="_blank" rel="noreferrer" className="block mt-4 text-xs font-medium text-blue-500 hover:underline">
                    Buka Link (Test Preview)
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="glass-card p-6 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgb(92,64,51,0.05)] border border-white/60">
            <h2 className="text-xl font-bold text-[#5C4033] mb-6">Daftar Pesanan</h2>
            
            {isLoadingList ? (
              <div className="flex justify-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5C4033]"></div>
              </div>
            ) : messagesList.length === 0 ? (
              <div className="text-center p-10 text-[#A47B8E]">
                Belum ada pesanan yang dibuat.
              </div>
            ) : (
              <div className="space-y-4">
                {messagesList.map((msg) => (
                  <div key={msg.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#F3E1E4] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    
                    {editingId === msg.id ? (
                      <div className="flex-1 w-full space-y-3">
                        <input type="text" value={editRecipient} onChange={e => setEditRecipient(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Penerima"/>
                        <input type="text" value={editSender} onChange={e => setEditSender(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="Pengirim"/>
                        <textarea value={editMessage} onChange={e => setEditMessage(e.target.value)} className="w-full p-2 border rounded-lg text-sm" rows={2}></textarea>
                        
                        <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input type="checkbox" checked={editChangeMedia} onChange={(e) => setEditChangeMedia(e.target.checked)} className="rounded text-[#5C4033] focus:ring-[#5C4033]" />
                            <span className="text-sm font-semibold text-[#8B5A2B]">Ganti Media (Opsional)</span>
                          </label>
                          
                          {editChangeMedia && (
                            <div className="mt-3 space-y-3 animate-fade-in-up">
                              <div className="grid grid-cols-3 gap-2">
                                {(["video", "image", "youtube"] as const).map((type) => (
                                  <button key={type} onClick={(e) => { e.preventDefault(); setEditMediaType(type); }} className={`py-2 rounded-xl text-xs font-bold transition-all ${editMediaType === type ? 'bg-[#5C4033] text-white shadow-md' : 'bg-white text-[#A47B8E] border border-[#F3E1E4] hover:bg-[#FDFBF7]'}`}>
                                    {type === 'video' ? 'Video' : type === 'image' ? 'Gambar' : 'Link / URL'}
                                  </button>
                                ))}
                              </div>
                              {editMediaType === 'youtube' ? (
                                <input type="url" value={editYoutubeUrl} onChange={e => setEditYoutubeUrl(e.target.value)} className="w-full p-3 border border-[#F3E1E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5C4033] focus:border-transparent transition-all bg-[#FDFBF7]" placeholder="Masukkan link YouTube, TikTok, Drive, dll (https://...)" required />
                              ) : (
                                <input type="file" accept={editMediaType === 'video' ? 'video/*' : 'image/*'} onChange={e => e.target.files && setEditMediaFile(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#F3E1E4] file:text-[#5C4033]" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1 pb-1">
                           <input type="checkbox" id="edit-autodelete" checked={editAutoDelete} onChange={(e) => setEditAutoDelete(e.target.checked)} className="rounded text-[#5C4033] focus:ring-[#5C4033]" />
                           <label htmlFor="edit-autodelete" className="text-xs text-gray-700 font-medium cursor-pointer">Hapus Otomatis (7 Hari)</label>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(msg.id)} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Simpan</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium">Batal</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#5C4033] text-lg">{msg.recipient}</h3>
                            <span className="text-xs bg-[#F3E1E4] text-[#8B5A2B] px-2 py-0.5 rounded-full font-medium">Dari: {msg.sender}</span>
                            {msg.media_type && (
                              <span className="text-xs border border-[#D4A5A5] text-[#A47B8E] px-2 py-0.5 rounded-full uppercase">{msg.media_type}</span>
                            )}
                            {msg.auto_delete ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                                7 Hari
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
                                Permanen
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                        
                        <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                          <button onClick={() => showQRForExisting(msg.id, msg.recipient)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                            Lihat QR
                          </button>
                          <button onClick={() => startEdit(msg)} className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(msg.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
