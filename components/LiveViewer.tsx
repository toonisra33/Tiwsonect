
import React, { useState, useEffect, useRef } from 'react';
import { User, LiveSession } from '../types';
import { ICONS, CURRENT_USER_ID, MOCK_LIVE_COMMENTS } from '../constants';

interface LiveViewerProps {
  session: LiveSession;
  hostUser: User;
  onLeave: () => void;
}

export const LiveViewer: React.FC<LiveViewerProps> = ({ session, hostUser, onLeave }) => {
  const [text, setText] = useState('');
  const [comments, setComments] = useState<{ id: string; user: string; text: string }[]>([]);
  const [viewers, setViewers] = useState(session.viewerCount);
  const [hearts, setHearts] = useState<{id: number, left: number}[]>([]);

  // Simulate incoming comments and viewers
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate Viewers
      setViewers(prev => Math.max(session.viewerCount, prev + Math.floor(Math.random() * 3) - 1));

      // Random Comments from others
      if (Math.random() < 0.4) {
        const randomComment = MOCK_LIVE_COMMENTS[Math.floor(Math.random() * MOCK_LIVE_COMMENTS.length)];
        const randomUser = `User${Math.floor(Math.random() * 1000)}`;
        setComments(prev => [...prev.slice(-5), { id: `c-${Date.now()}`, user: randomUser, text: randomComment }]);
      }
      
      // Random Hearts Animation
      if (Math.random() < 0.5) {
         addHeart();
      }

    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const addHeart = () => {
     setHearts(prev => [...prev, { id: Date.now(), left: Math.random() * 20 }]);
     // Clean up hearts
     setTimeout(() => {
        setHearts(prev => prev.slice(1));
     }, 2000);
  };

  const handleSend = () => {
     if(!text.trim()) return;
     setComments(prev => [...prev.slice(-5), { id: `me-${Date.now()}`, user: 'ฉัน', text }]);
     setText('');
     addHeart(); // Sending a comment sends a heart too
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
       {/* Simulation of Video Stream */}
       <div className="absolute inset-0 z-0">
          <video 
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
            className="w-full h-full object-cover opacity-80"
            autoPlay
            loop
            muted // Muted by default for simulation, user can unmute in real app
            playsInline
          />
       </div>

       {/* Overlay */}
       <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10">
          
          {/* Top Info */}
          <div className="flex justify-between items-start pointer-events-auto">
             <div className="flex items-center space-x-2 bg-black/20 p-1 rounded-full pr-3 backdrop-blur-md border border-white/10">
                 <img src={hostUser.avatar} className="w-8 h-8 rounded-full" />
                 <div>
                    <h3 className="text-white text-xs font-bold">{hostUser.name}</h3>
                    <p className="text-white/70 text-[10px]">กำลังถ่ายทอดสด</p>
                 </div>
                 <button className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold ml-2">ติดตาม</button>
             </div>

             <div className="flex items-center space-x-2">
                 <div className="bg-red-600 px-2 py-0.5 rounded text-white text-xs font-bold">LIVE</div>
                 <button onClick={onLeave} className="bg-black/20 p-1 rounded-full text-white">&times;</button>
             </div>
          </div>

          {/* Bottom Interaction */}
          <div className="pointer-events-auto w-full max-w-lg mx-auto">
             {/* Floating Hearts Container */}
             <div className="relative h-40 w-full overflow-hidden pointer-events-none">
                {hearts.map(h => (
                   <div 
                     key={h.id} 
                     className="absolute bottom-0 text-2xl animate-float-up opacity-0"
                     style={{ right: `${10 + h.left}px` }}
                   >
                     ❤️
                   </div>
                ))}
             </div>

             {/* Chat List */}
             <div className="max-h-48 overflow-y-auto space-y-2 mb-4 mask-gradient-top px-2">
                 {comments.map((c) => (
                    <div key={c.id} className="text-sm text-white drop-shadow-md">
                       <span className="font-bold text-white/90 mr-2 opacity-80">{c.user}</span>
                       <span className="text-white">{c.text}</span>
                    </div>
                 ))}
             </div>

             {/* Input Area */}
             <div className="flex items-center space-x-2 pb-safe">
                <input 
                  type="text" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="แสดงความคิดเห็น..."
                  className="flex-1 bg-black/30 text-white placeholder-white/50 border border-white/20 rounded-full px-4 py-2.5 focus:outline-none focus:border-white/50 backdrop-blur-sm text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="p-2.5 bg-blue-600 rounded-full text-white shadow-lg disabled:opacity-50"
                  disabled={!text}
                >
                   {ICONS.Send}
                </button>
                <button 
                   onClick={addHeart}
                   className="p-2.5 bg-pink-600 rounded-full text-white shadow-lg active:scale-90 transition-transform"
                >
                   {ICONS.Heart}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};
