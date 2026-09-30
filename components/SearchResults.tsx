
import React from 'react';
import { User, Post } from '../types';
import { Feed } from './Feed';
import { ICONS } from '../constants';

interface SearchResultsProps {
  query: string;
  users: User[];
  posts: Post[];
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onSave: (postId: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  query, 
  users, 
  posts, 
  onLike, 
  onComment, 
  onSave 
}) => {
  const lowerQuery = query.toLowerCase();

  // Filter Users
  const foundUsers = users.filter(u => 
    u.name.toLowerCase().includes(lowerQuery)
  );

  // Filter Posts
  const foundPosts = posts.filter(p => 
    p.content?.toLowerCase().includes(lowerQuery) || 
    p.mood?.toLowerCase().includes(lowerQuery) ||
    p.locationName?.toLowerCase().includes(lowerQuery)
  );

  return (
    <div className="pb-24 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <div className="p-4 bg-white shadow-sm border-b border-gray-100">
        <h2 className="text-gray-500 text-sm">ผลการค้นหาสำหรับ "{query}"</h2>
      </div>

      {/* Users Section */}
      {foundUsers.length > 0 && (
        <div className="bg-white mb-4 shadow-sm pb-2">
          <div className="px-4 py-2 border-b border-gray-50">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              {ICONS.Users} ผู้ใช้งาน
            </h3>
          </div>
          <div className="px-2">
            {foundUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.bio?.slice(0, 30)}...</p>
                  </div>
                </div>
                <button className="text-blue-600 text-xs border border-blue-600 px-3 py-1 rounded-full hover:bg-blue-50">
                  ดูโปรไฟล์
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      <div className="mt-2">
        <div className="px-4 py-2 mb-2">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            {ICONS.Grid} โพสต์ที่เกี่ยวข้อง
          </h3>
        </div>
        {foundPosts.length > 0 ? (
          <Feed 
            posts={foundPosts} 
            users={users} 
            onLike={onLike} 
            onComment={onComment} 
            onSave={onSave} 
            showStories={false}
            showInsight={false}
          />
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>ไม่พบโพสต์ที่เกี่ยวข้อง</p>
          </div>
        )}
      </div>

      {foundUsers.length === 0 && foundPosts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="scale-150 mb-2 opacity-50">{ICONS.Search}</div>
            <p>ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        </div>
      )}
    </div>
  );
};
