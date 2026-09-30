import React, { useEffect, useState } from 'react';

interface AiInsightCardProps {
  insight: string;
  onDismiss: () => void;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ insight, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="mx-2 sm:mx-0 mt-4 mb-2 p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg text-white relative overflow-hidden animate-fade-in-up border border-indigo-400/30">
      <div className="flex items-start gap-3 relative z-10">
        <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-md shadow-inner">
          <span className="text-2xl">🤖</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
             <h3 className="font-bold text-xs tracking-wider text-indigo-100 uppercase flex items-center gap-1">
               AI Analysis • วิเคราะห์พฤติกรรม
             </h3>
             <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded-full text-white/80">{timeLeft}s</span>
          </div>
          <p className="text-sm font-medium text-white leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};
