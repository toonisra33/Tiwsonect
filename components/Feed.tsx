
import React from 'react';
import { Post, User, LiveSession } from '../types';
import { ICONS, CURRENT_USER_ID } from '../constants';
import { Stories } from './Stories';
import { AiInsightCard } from './AiInsightCard';

interface FeedProps {
  posts: Post[];
  users: User[];
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onSave: (postId: string) => void;
  aiInsight?: string | null;
  onClearInsight?: () => void;
  showStories?: boolean;
  showInsight?: boolean;
  activeLiveSessions?: LiveSession[];
  onJoinLive?: (sessionId: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ 
  posts, 
  users, 
  onLike, 
  onComment, 
  onSave, 
  aiInsight, 
  onClearInsight,
  showStories = true,
  showInsight = true,
  activeLiveSessions = [],
  onJoinLive = () => {}
}) => {
  const [commentText, setCommentText] = React.useState<{ [key: string]: string }>({});

  const getUser = (id: string) => users.find(u => u.id === id) || users[0];

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (commentText[postId]?.trim()) {
      onComment(postId, commentText[postId]);
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleShare = async (post: Post) => {
    // Ensure URL is valid for sharing API (must be http/https)
    let shareUrl = window.location.href;
    if (!shareUrl.startsWith('http')) {
        shareUrl = 'https://tiwsonect.app'; // Default fallback URL
    }

    const shareData = {
      title: 'TiWsonect Post',
      text: post.content ? post.content.slice(0, 100) : 'Check out this post!',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      console.warn('Share failed, falling back to clipboard:', err);
      // Fallback logic inside catch to ensure it runs if share fails
      try {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = `${shareData.text}\n${shareData.url}`;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        alert('คัดลอกลิงก์โพสต์เรียบร้อยแล้ว!');
      } catch (clipboardErr) {
        console.error('Clipboard failed:', clipboardErr);
        alert('ไม่สามารถแชร์ได้ในขณะนี้');
      }
    }
  };

  // 1. Separate Broadcasts and Regular Posts
  const currentTime = Date.now();
  const broadcastPosts = posts.filter(p => p.isBroadcast && p.broadcastExpiresAt && p.broadcastExpiresAt > currentTime);
  const regularPosts = posts.filter(p => !p.isBroadcast || (p.isBroadcast && p.broadcastExpiresAt && p.broadcastExpiresAt <= currentTime));

  const renderPostImages = (images: string[]) => {
      if (!images || images.length === 0) return null;

      if (images.length === 1) {
          return <img src={images[0]} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" />;
      }
      if (images.length === 2) {
          return (
              <div className="grid grid-cols-2 gap-0.5">
                  <img src={images[0]} className="w-full h-64 object-cover" />
                  <img src={images[1]} className="w-full h-64 object-cover" />
              </div>
          );
      }
      if (images.length === 3) {
          return (
              <div className="grid grid-cols-2 gap-0.5">
                  <img src={images[0]} className="w-full h-full object-cover row-span-2" />
                  <div className="flex flex-col gap-0.5">
                    <img src={images[1]} className="w-full h-32 object-cover" />
                    <img src={images[2]} className="w-full h-32 object-cover" />
                  </div>
              </div>
          );
      }
      if (images.length === 4) {
         return (
             <div className="grid grid-cols-2 gap-0.5">
                 {images.slice(0, 4).map((img, i) => (
                     <img key={i} src={img} className="w-full h-32 object-cover" />
                 ))}
             </div>
         );
      }
      // 5 or more
      return (
        <div className="grid grid-cols-2 gap-0.5">
            {images.slice(0, 3).map((img, i) => (
                <img key={i} src={img} className="w-full h-32 object-cover" />
            ))}
            <div className="relative w-full h-32">
                 <img src={images[3]} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                    +{images.length - 4}
                 </div>
            </div>
        </div>
      );
  };

  const renderPost = (post: Post, isBroadcastActive: boolean = false) => {
      const author = getUser(post.userId);
      const isLiked = post.likes.includes(CURRENT_USER_ID);
      const isSaved = post.savedBy?.includes(CURRENT_USER_ID);

      // Collect all images (new 'images' array or old 'image' string)
      let displayImages: string[] = [];
      if (post.images && post.images.length > 0) {
          displayImages = post.images;
      } else if (post.image) {
          displayImages = [post.image];
      }

      return (
        <div 
          key={post.id} 
          className={`bg-white border shadow-sm rounded-xl overflow-hidden mx-2 sm:mx-0 transition-all ${
            isBroadcastActive ? 'border-blue-300 shadow-blue-100 ring-2 ring-blue-50 relative mb-4' : 'border-gray-100'
          }`}
        >
          {/* Broadcast Badge */}
          {isBroadcastActive && (
            <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 flex items-center justify-between">
                <span className="flex items-center gap-1">{ICONS.Broadcast} ประกาศจากผู้ดูแล</span>
                <span>ปักหมุด 30 นาที</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center p-3">
            <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div className="ml-3 flex-1">
              <div className="text-sm font-semibold text-gray-900 flex flex-wrap items-center gap-1">
                <span>{author.name}</span>
                {post.mood && (
                  <span className="font-normal text-gray-600 text-xs">
                    กำลังรู้สึก {post.mood}
                  </span>
                )}
                {post.locationName && (
                  <span className="font-normal text-gray-600 text-xs flex items-center">
                    ที่ <span className="font-semibold text-gray-800 ml-1">{post.locationName}</span>
                  </span>
                )}
                {isBroadcastActive && <span className="text-blue-500">{ICONS.Map}</span>} 
              </div>
              <p className="text-xs text-gray-500">
                {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                {post.location?.lat && !post.locationName ? ' • กรุงเทพฯ' : ''}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">{ICONS.More}</button>
          </div>

          {/* Content Text */}
          {post.content && (
              <div className="px-3 pb-2">
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p>
              </div>
          )}

          {/* Media Content */}
          {post.type === 'short_video' && post.video ? (
              /* Short Video (9:16) Rendering */
              <div className="w-full bg-black flex justify-center py-2 relative">
                  <div className="aspect-[9/16] max-h-[500px] w-auto relative rounded-lg overflow-hidden shadow-lg border border-gray-800">
                      <video 
                          src={post.video} 
                          controls 
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                          poster={displayImages[0]} // Use first image as poster if available
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm pointer-events-none">
                          Shorts ⚡️
                      </div>
                  </div>
              </div>
          ) : post.type === 'video' && post.video ? (
            /* Regular Video Rendering */
            <div className="w-full bg-black">
                <video 
                    src={post.video} 
                    controls 
                    playsInline
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                    poster={displayImages[0]}
                />
            </div>
          ) : displayImages.length > 0 ? (
             /* Image Grid Rendering - Only if images exist */
             <div className="w-full bg-gray-100">
                 {renderPostImages(displayImages)}
             </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-50">
            <div className="flex space-x-4">
              <button 
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {isLiked ? ICONS.HeartFilled : ICONS.Heart}
                <span className="text-xs font-medium">{post.likes.length > 0 ? post.likes.length : 'ถูกใจ'}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                {ICONS.Comment}
                <span className="text-xs font-medium">{post.comments.length > 0 ? post.comments.length : 'ความคิดเห็น'}</span>
              </button>
              <button 
                onClick={() => handleShare(post)}
                className="text-gray-600 hover:text-gray-900"
              >
                {ICONS.Share}
              </button>
            </div>
            
            {/* Save Button */}
            <button 
              onClick={() => onSave(post.id)}
              className={`flex items-center space-x-1 ${isSaved ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
               {isSaved ? ICONS.BookmarkFilled : ICONS.Bookmark}
            </button>
          </div>

          {/* Comments Preview */}
          {post.comments.length > 0 && (
            <div className="px-3 pb-3 space-y-2">
              {post.comments.slice(-2).map(c => {
                const cUser = getUser(c.userId);
                return (
                  <div key={c.id} className="flex space-x-2 text-xs">
                    <span className="font-semibold text-gray-900">{cUser.name}</span>
                    <span className="text-gray-700">{c.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Comment */}
          <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex items-center px-3 py-2 border-t border-gray-100">
            <input
              type="text"
              placeholder="แสดงความคิดเห็น..."
              className="flex-1 text-sm outline-none bg-transparent"
              value={commentText[post.id] || ''}
              onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
            />
            <button 
              type="submit" 
              disabled={!commentText[post.id]}
              className="text-blue-500 font-semibold text-sm disabled:opacity-50 ml-2"
            >
              โพสต์
            </button>
          </form>
        </div>
      );
  };

  return (
    <div className="pb-24 max-w-lg mx-auto bg-gray-50 min-h-screen">
      
      {/* 1. BROADCAST POSTS (Pinned at top) */}
      <div className="space-y-4 pt-4">
         {broadcastPosts.map(p => renderPost(p, true))}
      </div>

      {/* 2. AI INSIGHT CARD (Under broadcast, above stories) */}
      {showInsight && aiInsight && onClearInsight && (
         <AiInsightCard insight={aiInsight} onDismiss={onClearInsight} />
      )}

      {/* 3. STORIES */}
      {showStories && (
        <Stories 
          users={users} 
          activeLiveSessions={activeLiveSessions}
          onJoinLive={onJoinLive}
          onAddStory={() => alert('ฟีเจอร์เพิ่มสตอรี่ยังไม่เปิดใช้งาน (Demo)')}
          onViewStory={(id) => alert(`ดูสตอรี่ของ ${users.find(u => u.id === id)?.name}`)}
        />
      )}

      {/* 4. REGULAR POSTS */}
      <div className="space-y-4 pt-4">
        {regularPosts.map(p => renderPost(p, false))}
      </div>
    </div>
  );
};
