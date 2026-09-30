import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { ICONS, CURRENT_USER_ID } from '../constants';

interface NearbyProps {
  users: User[];
  currentUserLocation: { lat: number; lng: number } | null;
  onRequestLocation: () => void;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const Nearby: React.FC<NearbyProps> = ({ users, currentUserLocation, onRequestLocation }) => {
  const [sortedUsers, setSortedUsers] = useState<{ user: User; distance: number }[]>([]);

  useEffect(() => {
    if (currentUserLocation) {
      const others = users.filter(u => u.id !== CURRENT_USER_ID && u.location);
      const withDistance = others.map(u => ({
        user: u,
        distance: calculateDistance(currentUserLocation.lat, currentUserLocation.lng, u.location!.lat, u.location!.lng)
      }));
      withDistance.sort((a, b) => a.distance - b.distance);
      setSortedUsers(withDistance);
    }
  }, [currentUserLocation, users]);

  if (!currentUserLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center">
        <div className="bg-blue-100 p-6 rounded-full text-blue-600 mb-6">
          <span className="scale-150">{ICONS.Map}</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">ค้นหาเพื่อนใกล้เคียง</h2>
        <p className="text-gray-500 mb-6">เปิดใช้งานระบุตำแหน่งเพื่อดูว่าใครกำลังใช้งานอยู่ใกล้คุณบ้าง</p>
        <button 
          onClick={onRequestLocation}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition"
        >
          เปิดใช้งานตำแหน่ง
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 px-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        {ICONS.Map} <span className="ml-2">เพื่อนที่อยู่ใกล้คุณ</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {sortedUsers.map(({ user, distance }) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center text-center border border-gray-100 relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-br from-blue-400 to-indigo-500 z-0"></div>
            
            <div className="relative z-10 mt-4">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" />
                {user.isOnline && <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
            </div>
            
            <h3 className="mt-3 font-bold text-gray-800">{user.name}</h3>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full mt-1">
              ห่างไป {distance.toFixed(1)} กม.
            </span>
            
            <div className="mt-4 flex space-x-2 w-full">
                <button className="flex-1 bg-blue-600 text-white text-xs py-2 rounded-lg font-medium hover:bg-blue-700">
                    เพิ่มเพื่อน
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 text-xs py-2 rounded-lg font-medium hover:bg-gray-50">
                    ทักแชท
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};