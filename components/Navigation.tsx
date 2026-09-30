import React from 'react';
import { ViewState } from '../types';
import { ICONS } from '../constants';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  unreadChatCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, unreadChatCount }) => {
  const navItems = [
    { view: ViewState.FEED, icon: ICONS.Home, label: 'หน้าหลัก' },
    { view: ViewState.EXPLORE_NEARBY, icon: ICONS.Map, label: 'ใกล้ฉัน' },
    { view: ViewState.CREATE_POST, icon: ICONS.Add, label: 'โพสต์', isAction: true },
    { view: ViewState.SHORT_CLIPS, icon: ICONS.Clapperboard, label: 'คลิป' },
    { view: ViewState.PROFILE, icon: ICONS.Profile, label: 'โปรไฟล์' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
              item.isAction ? 'text-blue-600 -mt-6' : ''
            } ${
              !item.isAction && currentView === item.view ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <div className={`relative ${item.isAction ? 'bg-blue-100 p-3 rounded-full shadow-md' : ''}`}>
              {item.icon}
            </div>
            {!item.isAction && <span className="text-[10px] font-medium">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};