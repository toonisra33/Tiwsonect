import React from 'react';
import { Notification, User } from '../types';
import { ICONS } from '../constants';

interface NotificationDropdownProps {
  notifications: Notification[];
  users: User[];
  onClose: () => void;
  onMarkAsRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, users, onClose, onMarkAsRead }) => {
  // Filter for display
  const displayNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

  const getUser = (id: string) => users.find(u => u.id === id) || users[0];

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <span className="text-red-500">{ICONS.HeartFilled}</span>;
      case 'comment': return <span className="text-blue-500">{ICONS.Comment}</span>;
      default: return <span className="text-gray-500">{ICONS.Profile}</span>;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Dropdown */}
      <div className="absolute top-16 right-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">การแจ้งเตือน</h3>
          <button onClick={onMarkAsRead} className="text-xs text-blue-600 font-medium hover:underline">
            อ่านทั้งหมด
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {displayNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              ยังไม่มีการแจ้งเตือน
            </div>
          ) : (
            displayNotifications.map(notif => {
              const actor = getUser(notif.userId);
              return (
                <div 
                  key={notif.id} 
                  className={`p-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="relative">
                    <img src={actor.avatar} alt={actor.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{actor.name}</span>
                      {notif.type === 'like' && ' ถูกใจโพสต์ของคุณ'}
                      {notif.type === 'comment' && ` แสดงความคิดเห็น: "${notif.text}"`}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};