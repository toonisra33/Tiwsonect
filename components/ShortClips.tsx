
import React from 'react';
import { Post, User } from '../types';
import { ICONS, CURRENT_USER_ID } from '../constants';

interface ShortClipsProps {
  posts: Post[];
  users: User[];
  onLike: (postId: string) => void;
}

export const ShortClips: React.FC<ShortClipsProps> = ({ posts, users, onLike }) => {
  // Filter only posts with type 'short_video' or standard videos
  const clips = posts.filter(p => (p.type === 'short_video' || p.type === 'video') && p.video);

  const getUser = (id: string) => users.find(u => u.id === id) || users[0];

  const handleShare = async (clip: Post) => {
    // Ensure URL is valid
    let shareUrl = window.location.href;
    if (!shareUrl.startsWith('http')) {
        shareUrl = 'https://tiwsonect.app';
    }

    const shareData = {
      title: 'TiWsonect Clip',
      text: clip.content ? clip.content : 'Watch this cool clip on TiWsonect!',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share API not supported');
      }
    } catch (err) {
      console.log('Share failed, fallback to clipboard', err);
      try {
        // Fallback to text area method which works better without focus in some mobile browsers
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = `${shareData.text}\n${shareData.url}`;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        alert('คัดลอกลิงก์คลิปเรียบร้อยแล้ว!');
      } catch (clipboardErr) {
        console.error('Clipboard failed:', clipboardErr);
        alert('ไม่สามารถแชร์ได้ในขณะนี้');
      }
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-16">
      {clips.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <div className="p-4 bg-gray-800 rounded-full mb-4">
             {ICONS.Video}
          </div>
          <p>ยังไม่มีคลิปสั้นในขณะนี้</p>
        </div>
      ) : (
        clips.map((clip) => {
            const user = getUser(clip.userId);
            const isLiked = clip.likes.includes(CURRENT_USER_ID);
            
            return (
              <div key={clip.id} className="w-full h-full snap-start relative flex items-center justify-center bg-black border-b border-gray-800">
                 <video 
                    src={clip.video} 
                    className="h-full w-full object-cover max-w-lg mx-auto"
                    loop
                    playsInline
                    autoPlay
                    muted
                    onClick={(e) => {
                       // Toggle mute on click
                       const v = e.currentTarget;
                       v.muted = !v.muted;
                    }}
                 />
                 
                 {/* Top Shadow Gradient */}
                 <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
                 {/* Bottom Shadow Gradient */}
                 <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

                 {/* Overlay Info */}
                 <div className="absolute bottom-20 left-4 right-16 text-white z-10 max-w-md mx-auto w-full">
                    <div className="flex items-center space-x-2 mb-3">
                       <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white" alt={user.name} />
                       <span className="font-bold drop-shadow-md">{user.name}</span>
                       <button className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">ติดตาม</button>
                    </div>
                    <p className="text-sm drop-shadow-md mb-2 line-clamp-2">{clip.content}</p>
                    {clip.locationName && (
                        <div className="text-xs bg-white/20 inline-flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm">
                           📍 {clip.locationName}
                        </div>
                    )}
                 </div>

                 {/* Right Sidebar Actions */}
                 <div className="absolute bottom-20 right-2 flex flex-col items-center space-y-6 text-white z-10 max-w-md mx-auto w-full items-end pr-2">
                    <button onClick={() => onLike(clip.id)} className="flex flex-col items-center space-y-1 group">
                        <div className={`p-3 rounded-full bg-black/30 backdrop-blur-sm transition-transform group-active:scale-75 ${isLiked ? 'text-red-500' : 'text-white'}`}>
                           {isLiked ? ICONS.HeartFilled : ICONS.Heart}
                        </div>
                        <span className="text-xs font-bold shadow-sm">{clip.likes.length}</span>
                    </button>
                     <button className="flex flex-col items-center space-y-1">
                        <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                           {ICONS.Comment}
                        </div>
                        <span className="text-xs font-bold shadow-sm">{clip.comments.length}</span>
                    </button>
                    <button 
                        onClick={() => handleShare(clip)}
                        className="flex flex-col items-center space-y-1"
                    >
                        <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                           {ICONS.Share}
                        </div>
                        <span className="text-xs font-bold shadow-sm">แชร์</span>
                    </button>
                 </div>
              </div>
            );
        })
      )}
    </div>
  );
};
