
import React, { useRef, useState, useEffect } from 'react';
import { CategoryDef, Transaction } from '../types';
import { analyzeReceipt } from '../services/geminiService';

interface ScanReceiptProps {
  categories: CategoryDef[];
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const ScanReceipt: React.FC<ScanReceiptProps> = ({ categories, onSave, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Kamera başlatılamadı:", err);
      alert("Kameraya erişilemedi. Lütfen izinleri kontrol edin.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      processImage(base64);
      stopCamera();
      setIsCameraActive(false);
    }
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    const result = await analyzeReceipt(base64, categories);
    setIsProcessing(false);
    if (result) {
      setScannedData(result);
    } else {
      alert("Fiş analiz edilemedi. Lütfen daha net bir fotoğraf çekin.");
      startCamera();
    }
  };

  const handleConfirm = () => {
    if (scannedData) {
      onSave({
        amount: scannedData.amount,
        category: scannedData.categoryId,
        date: scannedData.date,
        type: 'expense',
        note: scannedData.note
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Üst Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-white font-black uppercase tracking-widest text-sm">Fiş Tarayıcı</h2>
        <div className="w-12"></div>
      </div>

      {isCameraActive && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          {/* Vizör Çerçevesi */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-3/5 border-2 border-dashed border-white/50 rounded-3xl relative">
               <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
               <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
               <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
               <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>
          
          <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6">
            <p className="text-white/70 text-[10px] font-bold uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
              Fişi çerçeve içine yerleştirin
            </p>
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl active:scale-90 transition-transform"
            >
              <div className="w-full h-full border-4 border-black/10 rounded-full flex items-center justify-center">
                 <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0f172a] p-10 text-center">
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
          </div>
          <h3 className="text-2xl font-black mb-3">Fiş Analiz Ediliyor</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Gemini AI görüntüdeki tutar, tarih ve ürün bilgilerini çıkartıyor. Lütfen bekleyin...
          </p>
        </div>
      )}

      {scannedData && !isProcessing && (
        <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto no-scrollbar pb-32">
          <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
            <img src={capturedImage!} alt="Fiş" className="w-full h-full object-cover" />
          </div>
          
          <div className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/10 animate-in slide-in-from-bottom-10">
            <div className="text-center mb-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tespit Edilen Mağaza</p>
              <h3 className="text-2xl font-black text-white">{scannedData.storeName || 'Bilinmeyen Mağaza'}</h3>
            </div>

            <div className="flex justify-between items-center py-4 border-y border-white/5">
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Toplam Tutar</p>
                 <p className="text-3xl font-black text-blue-400">₺{scannedData.amount.toLocaleString('tr-TR')}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Tarih</p>
                 <p className="text-sm font-bold text-slate-200">{new Date(scannedData.date).toLocaleDateString('tr-TR')}</p>
               </div>
            </div>

            <div className="flex items-center gap-4 py-2">
               <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl">
                 {categories.find(c => c.id === scannedData.categoryId)?.icon || '📦'}
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Önerilen Kategori</p>
                 <p className="font-bold text-white">{categories.find(c => c.id === scannedData.categoryId)?.name || 'Diğer'}</p>
               </div>
            </div>

            {scannedData.note && (
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">İşlem Özeti</p>
                <p className="text-xs text-slate-300 italic">"{scannedData.note}"</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
               <button 
                 onClick={() => { setScannedData(null); startCamera(); }}
                 className="flex-1 py-4 text-slate-500 font-bold bg-slate-800/50 rounded-2xl"
               >
                 Yeniden Çek
               </button>
               <button 
                 onClick={handleConfirm}
                 className="flex-[2] bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
               >
                 Harcamayı Kaydet
               </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ScanReceipt;
