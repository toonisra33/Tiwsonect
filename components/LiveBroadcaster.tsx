
import React, { useEffect, useRef, useState } from 'react';
import { ICONS, MOCK_LIVE_COMMENTS } from '../constants';

interface LiveBroadcasterProps {
  onEndLive: () => void;
}

export const LiveBroadcaster: React.FC<LiveBroadcasterProps> = ({ onEndLive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<{ id: string; user: string; text: string }[]>([]);
  const [duration, setDuration] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');

  // Effect / Beauty States
  const [showEffects, setShowEffects] = useState(false);
  const [activeTab, setActiveTab] = useState<'beauty' | 'filter' | 'effect'>('beauty');
  
  // Beauty Params
  const [skinSmooth, setSkinSmooth] = useState(0); // 0-100
  const [faceShape, setFaceShape] = useState(0);   // 0-100
  
  // Filter Params
  const [activeFilter, setActiveFilter] = useState('none');
  
  // AR Effect (Overlay)
  const [activeArEffect, setActiveArEffect] = useState<string | null>(null);

  const FILTERS = [
    { id: 'none', label: 'ปกติ', style: 'none' },
    { id: 'vivid', label: 'สดใส', style: 'saturate(1.5) contrast(1.1)' },
    { id: 'warm', label: 'อบอุ่น', style: 'sepia(0.3) saturate(1.2)' },
    { id: 'cool', label: 'เย็น', style: 'hue-rotate(180deg) opacity(0.9)' },
    { id: 'mono', label: 'ขาวดำ', style: 'grayscale(1)' },
    { id: 'vintage', label: 'วินเทจ', style: 'sepia(0.5) contrast(0.8) brightness(1.1)' },
  ];

  const AR_EFFECTS = [
    { id: 'none', label: 'ปิด', emoji: '🚫' },
    { id: 'ears', label: 'หูแมว', emoji: '🐱' },
    { id: 'glasses', label: 'แว่นตา', emoji: '😎' },
    { id: 'heart', label: 'หัวใจ', emoji: '💖' },
    { id: 'star', label: 'ดาว', emoji: '✨' },
  ];

  // 1. Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('ไม่สามารถเข้าถึงกล้องและไมโครโฟนได้');
      }
    };
    startCamera();

    return () => {
      // Cleanup tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Simulation Interval (Viewers + Comments + Timer)
  useEffect(() => {
    if (!isCameraActive) return;

    const interval = setInterval(() => {
      // Timer
      setDuration(prev => prev + 1);

      // Fluctuate Viewers
      setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 5) - 2));

      // Random Comments (30% chance per second)
      if (Math.random() < 0.3) {
        const randomComment = MOCK_LIVE_COMMENTS[Math.floor(Math.random() * MOCK_LIVE_COMMENTS.length)];
        const randomUser = `User${Math.floor(Math.random() * 1000)}`;
        setComments(prev => [...prev.slice(-4), { id: `c-${Date.now()}`, user: randomUser, text: randomComment }]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Calculate CSS Filter String based on settings
  const getComputedVideoStyle = () => {
    let filterString = '';
    
    // 1. Base Filter (Color Grading)
    const selectedFilter = FILTERS.find(f => f.id === activeFilter);
    if (selectedFilter && selectedFilter.id !== 'none') {
        filterString += `${selectedFilter.style} `;
    }

    // 2. Beauty: Skin Smooth (Simulated with brightness/blur/contrast)
    // NOTE: True smoothing needs WebGL. Here we fake it with brightness and slight contrast reduction.
    if (skinSmooth > 0) {
        const brightness = 1 + (skinSmooth / 400); // Max 1.25
        const contrast = 1 - (skinSmooth / 500);   // Min 0.8
        // const blur = skinSmooth > 50 ? `blur(${skinSmooth/200}px)` : ''; // Blur affects eyes too much, skipping
        filterString += `brightness(${brightness}) contrast(${contrast}) `;
    }

    return { filter: filterString };
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onEndLive} className="px-6 py-2 bg-gray-700 rounded-lg">กลับ</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Video Container with Filters */}
      <div className="relative w-full h-full">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transition-all duration-300"
            style={getComputedVideoStyle()}
        />

        {/* AR Sticker Overlay (Simulation) */}
        {activeArEffect && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                {activeArEffect === 'ears' && <div className="text-[150px] -mt-60 opacity-90 drop-shadow-2xl animate-bounce-slow">🐱</div>}
                {activeArEffect === 'glasses' && <div className="text-[120px] -mt-20 opacity-90 drop-shadow-2xl">😎</div>}
                {activeArEffect === 'heart' && <div className="absolute top-20 right-10 text-6xl animate-pulse">💖</div>}
                {activeArEffect === 'star' && <div className="absolute top-20 left-10 text-6xl animate-spin-slow">✨</div>}
            </div>
        )}
      </div>

      {/* Main Overlay UI (Hidden when Effects Panel is OPEN) */}
      {!showEffects && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none">
            {/* Top Header */}
            <div className="flex justify-between items-center pointer-events-auto">
            <div className="flex items-center space-x-2">
                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">LIVE</div>
                <div className="bg-black/40 px-2 py-0.5 rounded-sm text-white text-xs font-mono">{formatTime(duration)}</div>
            </div>
            
            <div className="flex items-center space-x-2">
                <div className="bg-black/40 px-3 py-1 rounded-full text-white text-xs flex items-center space-x-1">
                    {ICONS.Users}
                    <span>{viewers}</span>
                </div>
                <button onClick={onEndLive} className="text-white p-1">
                    &times;
                </button>
            </div>
            </div>

            {/* Bottom Area */}
            <div className="w-full pointer-events-auto">
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4 mask-gradient-top">
                {comments.map((c) => (
                    <div key={c.id} className="flex items-start space-x-2 text-sm text-white/90 animate-fade-in-up">
                    <span className="font-bold text-white/70">{c.user}</span>
                    <span>{c.text}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white/80">
                    <button 
                        onClick={() => setShowEffects(true)}
                        className="flex flex-col items-center space-y-1 group"
                    >
                        <div className="p-2.5 bg-white/20 rounded-full border border-white/30 backdrop-blur-md group-active:scale-90 transition">
                             {ICONS.Beauty}
                        </div>
                        <span className="text-[10px] font-medium shadow-sm">เอฟเฟกต์</span>
                    </button>
                    <button className="p-2.5 bg-black/20 rounded-full">{ICONS.Mic}</button>
                    <button className="p-2.5 bg-black/20 rounded-full">{ICONS.Camera}</button>
                </div>
                
                <button 
                    onClick={onEndLive}
                    className="bg-red-600 text-white font-bold px-6 py-2 rounded-full shadow-lg"
                >
                    สิ้นสุด
                </button>
            </div>
            </div>
        </div>
      )}

      {/* Effects Panel (Bottom Sheet) */}
      {showEffects && (
         <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-xl rounded-t-3xl z-50 animate-slide-up border-t border-white/10">
             {/* Header */}
             <div className="flex justify-between items-center p-4 border-b border-white/10">
                 <div className="flex space-x-6">
                     <button 
                        onClick={() => setActiveTab('beauty')}
                        className={`text-sm font-bold pb-2 border-b-2 transition ${activeTab === 'beauty' ? 'text-white border-blue-500' : 'text-gray-400 border-transparent'}`}
                     >
                        บิวตี้
                     </button>
                     <button 
                        onClick={() => setActiveTab('filter')}
                        className={`text-sm font-bold pb-2 border-b-2 transition ${activeTab === 'filter' ? 'text-white border-blue-500' : 'text-gray-400 border-transparent'}`}
                     >
                        ฟิลเตอร์
                     </button>
                     <button 
                        onClick={() => setActiveTab('effect')}
                        className={`text-sm font-bold pb-2 border-b-2 transition ${activeTab === 'effect' ? 'text-white border-blue-500' : 'text-gray-400 border-transparent'}`}
                     >
                        เอฟเฟกต์
                     </button>
                 </div>
                 <button onClick={() => setShowEffects(false)} className="text-white p-2 text-2xl leading-none">&times;</button>
             </div>

             {/* Content */}
             <div className="p-6 h-48 overflow-y-auto">
                 
                 {/* BEAUTY TAB */}
                 {activeTab === 'beauty' && (
                     <div className="space-y-6">
                         <div>
                             <div className="flex justify-between text-xs text-gray-300 mb-2">
                                 <span className="flex items-center gap-1">{ICONS.Sparkles} ผิวเนียน</span>
                                 <span>{skinSmooth}</span>
                             </div>
                             <input 
                                type="range" min="0" max="100" 
                                value={skinSmooth} onChange={(e) => setSkinSmooth(Number(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                             />
                         </div>
                         <div>
                             <div className="flex justify-between text-xs text-gray-300 mb-2">
                                 <span className="flex items-center gap-1">{ICONS.Beauty} หน้าเรียว (จำลอง)</span>
                                 <span>{faceShape}</span>
                             </div>
                             <input 
                                type="range" min="0" max="100" 
                                value={faceShape} onChange={(e) => setFaceShape(Number(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-pink-500"
                             />
                         </div>
                     </div>
                 )}

                 {/* FILTER TAB */}
                 {activeTab === 'filter' && (
                     <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                         {FILTERS.map(f => (
                             <button 
                                key={f.id}
                                onClick={() => setActiveFilter(f.id)}
                                className={`flex flex-col items-center flex-shrink-0 space-y-2`}
                             >
                                 <div className={`w-14 h-14 rounded-full bg-gray-700 overflow-hidden border-2 ${activeFilter === f.id ? 'border-blue-500' : 'border-transparent'}`}>
                                     {/* Preview color swatch */}
                                     <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600" style={{ filter: f.style }}></div>
                                 </div>
                                 <span className={`text-xs ${activeFilter === f.id ? 'text-white font-bold' : 'text-gray-400'}`}>{f.label}</span>
                             </button>
                         ))}
                     </div>
                 )}

                 {/* EFFECTS TAB */}
                 {activeTab === 'effect' && (
                     <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                         {AR_EFFECTS.map(ef => (
                             <button 
                                key={ef.id}
                                onClick={() => setActiveArEffect(ef.id === 'none' ? null : ef.id)}
                                className={`flex flex-col items-center flex-shrink-0 space-y-2`}
                             >
                                 <div className={`w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl border-2 ${activeArEffect === ef.id ? 'border-pink-500' : 'border-gray-700'}`}>
                                     {ef.emoji}
                                 </div>
                                 <span className={`text-xs ${activeArEffect === ef.id ? 'text-white font-bold' : 'text-gray-400'}`}>{ef.label}</span>
                             </button>
                         ))}
                     </div>
                 )}
             </div>
         </div>
      )}
    </div>
  );
};
