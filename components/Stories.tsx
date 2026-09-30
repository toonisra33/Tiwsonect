import React from 'react';
import { User, LiveSession } from '../types';
import { ICONS, CURRENT_USER_ID } from '../constants';

interface StoriesProps {
  users: User[];
  activeLiveSessions?: LiveSession[];
  onAddStory: () => void;
  onViewStory: (userId: string) => void;
  onJoinLive: (sessionId: string) => void;
}

export const Stories: React.FC<StoriesProps> = ({ users, activeLiveSessions = [], onAddStory, onViewStory, onJoinLive }) => {
  const currentUser = users.find(u => u.id === CURRENT_USER_ID);
  
  // Logic to separate users: Live users first, then users with stories
  const liveUsers = users.filter(u => activeLiveSessions.some(s => s.userId === u.id));
  const friendsWithStories = users.filter(u => u.id !== CURRENT_USER_ID && u.hasStory && !liveUsers.some(lu => lu.id === u.id));

  return (
    <div className="bg-white py-4 px-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
      <div className="flex space-x-4 pl-2">
        {/* Current User Story Add */}
        <div className="flex flex-col items-center space-y-1 min-w-[70px] cursor-pointer" onClick={onAddStory}>
          <div className="relative">
            <img 
              src={currentUser?.avatar} 
              alt="Your Story" 
              className="w-16 h-16 rounded-full border-2 border-gray-200 p-0.5 object-cover opacity-90"
            />
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 border-2 border-white">
              {ICONS.PlusSmall}
            </div>
          </div>
          <span className="text-xs font-medium text-gray-700 truncate w-16 text-center">สตอรี่ของคุณ</span>
        </div>

        {/* LIVE Users (Priority) */}
        {liveUsers.map(user => {
            const session = activeLiveSessions.find(s => s.userId === user.id);
            return (
              <div 
                key={user.id} 
                className="flex flex-col items-center space-y-1 min-w-[70px] cursor-pointer animate-pulse"
                onClick={() => session && onJoinLive(session.id)}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500 to-pink-600 p-[3px] animate-spin-slow">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full border-2 border-transparent relative z-10 p-0.5 object-cover"
                  />
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm z-20 border border-white">
                    LIVE
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-900 truncate w-16 text-center font-bold">{user.name}</span>
              </div>
            );
        })}

        {/* Friends Stories */}
        {friendsWithStories.map(user => (
          <div 
            key={user.id} 
            className="flex flex-col items-center space-y-1 min-w-[70px] cursor-pointer"
            onClick={() => onViewStory(user.id)}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white"></div>
              </div>
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-16 h-16 rounded-full border-2 border-transparent relative z-10 p-0.5 object-cover"
              />
            </div>
            <span className="text-xs font-medium text-gray-700 truncate w-16 text-center">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};