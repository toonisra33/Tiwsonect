
import React, { useState } from 'react';
import { User, Post, PrivacyLevel, UserProfileDetail } from '../types';
import { ICONS, CURRENT_USER_ID } from '../constants';

interface ProfileProps {
  user: User;
  isCurrentUser: boolean;
  posts: Post[];
}

export const Profile: React.FC<ProfileProps> = ({ user, isCurrentUser, posts }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends' | 'photos' | 'saved'>('posts');

  // Mock Data for "About" section with Privacy Settings
  const [details, setDetails] = useState<UserProfileDetail[]>([
    { id: 'job', icon: ICONS.Briefcase, label: 'ทำงานที่', value: 'Freelance Developer', privacy: 'public' },
    { id: 'edu', icon: ICONS.School, label: 'เคยศึกษาที่', value: 'มหาวิทยาลัยเทคโนโลยี', privacy: 'friends' },
    { id: 'loc', icon: ICONS.Map, label: 'อาศัยอยู่ที่', value: 'กรุงเทพมหานคร', privacy: 'public' },
    { id: 'rel', icon: ICONS.Heart, label: 'สถานะ', value: 'มีแฟนแล้ว', privacy: 'private' },
  ]);

  const togglePrivacy = (id: string) => {
    if (!isCurrentUser) return;
    const levels: PrivacyLevel[] = ['public', 'friends', 'private'];
    setDetails(prev => prev.map(d => {
      if (d.id === id) {
        const currentIndex = levels.indexOf(d.privacy);
        const nextIndex = (currentIndex + 1) % levels.length;
        return { ...d, privacy: levels[nextIndex] };
      }
      return d;
    }));
  };

  const getPrivacyIcon = (level: PrivacyLevel) => {
    switch (level) {
      case 'public': return ICONS.Globe;
      case 'friends': return ICONS.Users;
      case 'private': return ICONS.Lock;
    }
  };

  const getPrivacyLabel = (level: PrivacyLevel) => {
    switch (level) {
      case 'public': return 'สาธารณะ';
      case 'friends': return 'เพื่อนเท่านั้น';
      case 'private': return 'ส่วนตัว';
    }
  };

  // Helper to extract all images from posts
  const getAllPhotos = () => {
      // Filter posts by user ID for the photos tab
      const userPosts = posts.filter(p => p.userId === user.id);
      const photos: string[] = [];
      userPosts.forEach(p => {
          if (p.images && p.images.length > 0) {
              photos.push(...p.images);
          } else if (p.image) {
              photos.push(p.image);
          }
      });
      return photos;
  };

  // Filter posts for "Posts" tab (My posts)
  const myPosts = posts.filter(p => p.userId === user.id);

  // Filter posts for "Saved" tab
  const savedPosts = posts.filter(p => p.savedBy?.includes(CURRENT_USER_ID));

  const allPhotos = getAllPhotos();

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* 1. Cover Photo & Profile Header */}
      <div className="bg-white shadow-sm pb-4">
        <div className="relative h-48 sm:h-64 bg-gray-300">
          <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          {isCurrentUser && (
            <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md text-gray-700 hover:bg-white">
              {ICONS.Camera}
            </button>
          )}
        </div>

        <div className="px-4 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 mb-4">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white" 
              />
              {isCurrentUser && (
                <button className="absolute bottom-1 right-1 bg-gray-100 p-1.5 rounded-full border-2 border-white text-gray-700">
                  {ICONS.Camera}
                </button>
              )}
            </div>

            {/* Name & Bio */}
            <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {user.bio && <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{user.bio}</p>}
              
              {/* Stats Row Mobile */}
              <div className="flex justify-center sm:justify-start space-x-6 mt-3 text-sm text-gray-600">
                <span><b>{user.stats?.posts || 0}</b> โพสต์</span>
                <span><b>{user.stats?.followers || 0}</b> ผู้ติดตาม</span>
                <span><b>{user.stats?.following || 0}</b> กำลังติดตาม</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 sm:mt-0 flex space-x-2">
              {isCurrentUser ? (
                <>
                  <button className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold text-sm transition">
                    {ICONS.Edit} <span>แก้ไขโปรไฟล์</span>
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
                    {ICONS.PlusSmall} สตอรี่
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition shadow-sm">
                    {ICONS.Users} <span>ติดตาม</span>
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-700">
                    {ICONS.Chat}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200 mt-6 pt-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'posts', label: 'โพสต์', icon: ICONS.Grid },
              { id: 'about', label: 'เกี่ยวกับ', icon: ICONS.Info },
              { id: 'friends', label: 'เพื่อน', icon: ICONS.Users },
              { id: 'photos', label: 'รูปภาพ', icon: ICONS.Image },
              ...(isCurrentUser ? [{ id: 'saved', label: 'รายการโปรด', icon: ICONS.Bookmark }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="max-w-2xl mx-auto px-2 sm:px-0 py-4">
        
        {/* TAB: POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-2">โพสต์ล่าสุด</h3>
              {myPosts.length > 0 ? (
                 <div className="space-y-4">
                    {myPosts.map(p => {
                        // Display Thumbnail (First Image or Video Icon)
                        let thumbnail = null;
                        if (p.images && p.images.length > 0) thumbnail = p.images[0];
                        else if (p.image) thumbnail = p.image;
                        
                        return (
                            <div key={p.id} className="flex space-x-3 border-b border-gray-100 pb-3 last:border-0">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {thumbnail ? (
                                        <>
                                            <img src={thumbnail} className="w-full h-full object-cover" />
                                            {p.images && p.images.length > 1 && (
                                                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl">
                                                    +{p.images.length - 1}
                                                </div>
                                            )}
                                        </>
                                    ) : p.video || p.type === 'short_video' ? (
                                        <div className="w-full h-full bg-black flex items-center justify-center text-white">{ICONS.Video}</div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">{p.content.slice(0, 10)}...</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 line-clamp-2">{p.content || 'ไม่มีคำอธิบาย'}</p>
                                    <span className="text-xs text-gray-400 mt-1">{new Date(p.timestamp).toLocaleDateString('th-TH')}</span>
                                </div>
                            </div>
                        );
                    })}
                 </div>
              ) : (
                <div className="text-center py-8 text-gray-500">ยังไม่มีโพสต์</div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SAVED (New) */}
        {activeTab === 'saved' && isCurrentUser && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                   <div className="bg-blue-100 p-2 rounded-full text-blue-600">{ICONS.Bookmark}</div>
                   <h3 className="font-bold text-lg">รายการโปรด ({savedPosts.length})</h3>
                </div>
                
                {savedPosts.length > 0 ? (
                   <div className="space-y-4">
                      {savedPosts.map(p => {
                          let thumbnail = null;
                          if (p.images && p.images.length > 0) thumbnail = p.images[0];
                          else if (p.image) thumbnail = p.image;
                          
                          return (
                              <div key={p.id} className="flex space-x-3 border-b border-gray-100 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition cursor-pointer">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                      {thumbnail ? (
                                          <img src={thumbnail} className="w-full h-full object-cover" />
                                      ) : p.video || p.type === 'short_video' ? (
                                          <div className="w-full h-full bg-black flex items-center justify-center text-white">{ICONS.Video}</div>
                                      ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">{p.content.slice(0, 10)}...</div>
                                      )}
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.content || 'โพสต์ไม่มีข้อความ'}</p>
                                      <p className="text-xs text-gray-500 mt-1">บันทึกเมื่อ: {new Date(p.timestamp).toLocaleDateString('th-TH')}</p>
                                  </div>
                                  <div className="flex items-center">
                                      {ICONS.BookmarkFilled}
                                  </div>
                              </div>
                          );
                      })}
                   </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>ยังไม่มีรายการโปรด</p>
                    <p className="text-xs mt-1">กดปุ่มบันทึกที่โพสต์เพื่อดูย้อนหลังที่นี่</p>
                  </div>
                )}
              </div>
            </div>
        )}

        {/* TAB: ABOUT (Privacy Settings Showcase) */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
               <h3 className="font-bold text-lg">ข้อมูลเกี่ยวกับคุณ</h3>
               <p className="text-xs text-gray-500 mt-1">คุณสามารถเลือกได้ว่าจะให้ใครเห็นข้อมูลเหล่านี้บ้าง</p>
            </div>
            <div className="divide-y divide-gray-100">
              {details.map(detail => (
                <div key={detail.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div className="text-gray-400">{detail.icon}</div>
                    <div>
                      <span className="block text-xs text-gray-400">{detail.label}</span>
                      <span className="block text-sm font-medium">{detail.value}</span>
                    </div>
                  </div>
                  
                  {isCurrentUser && (
                    <button 
                      onClick={() => togglePrivacy(detail.id)}
                      className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition"
                      title={`ปัจจุบัน: ${getPrivacyLabel(detail.privacy)} (กดเพื่อเปลี่ยน)`}
                    >
                      <span className="text-gray-600">{getPrivacyIcon(detail.privacy)}</span>
                      <span className="text-xs font-semibold text-gray-600">{getPrivacyLabel(detail.privacy)}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FRIENDS */}
        {activeTab === 'friends' && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">เพื่อนทั้งหมด <span className="text-gray-500 text-base font-normal">(2,450)</span></h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="text-center">
                   <img src={`https://picsum.photos/seed/friend${i}/150/150`} className="w-full aspect-square rounded-lg object-cover mb-2" />
                   <p className="text-sm font-semibold truncate">เพื่อน คนที่ {i}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">ดูทั้งหมด</button>
          </div>
        )}

        {/* TAB: PHOTOS */}
        {activeTab === 'photos' && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-4">รูปภาพ ({allPhotos.length})</h3>
             {allPhotos.length > 0 ? (
                 <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                    {allPhotos.map((img, idx) => (
                        <img key={idx} src={img} className="w-full aspect-square object-cover hover:opacity-90 cursor-pointer" />
                    ))}
                    {/* Mock Extras */}
                    <img src="https://picsum.photos/seed/extra1/300/300" className="w-full aspect-square object-cover" />
                    <img src="https://picsum.photos/seed/extra2/300/300" className="w-full aspect-square object-cover" />
                 </div>
             ) : (
                <div className="text-center text-gray-500 py-8">ไม่มีรูปภาพ</div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};
