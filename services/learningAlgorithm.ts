import { Post } from '../types';

export const analyzeUserBehavior = (posts: Post[], currentUserId: string): string | null => {
  const userPosts = posts.filter(p => p.userId === currentUserId);
  
  if (userPosts.length === 0) return null; 

  // Analyze Moods
  const moods: Record<string, number> = {};
  userPosts.forEach(p => {
    if (p.mood) {
      // Use the full mood string (e.g. "มีความสุข 🤩")
      const label = p.mood; 
      moods[label] = (moods[label] || 0) + 1;
    }
  });
  
  // Analyze Locations
  const locations: Record<string, number> = {};
  userPosts.forEach(p => {
    if (p.locationName) {
      locations[p.locationName] = (locations[p.locationName] || 0) + 1;
    }
  });

  const topMood = Object.entries(moods).sort((a,b) => b[1] - a[1])[0]?.[0];
  const topLocation = Object.entries(locations).sort((a,b) => b[1] - a[1])[0]?.[0];

  // Logic to generate natural language insight
  if (topMood && topLocation) {
    return `AI สังเกตว่า: ช่วงนี้คุณมักจะรู้สึก "${topMood}" เวลาอยู่ที่ "${topLocation}" บ่อยๆ ลองหาเวลาพักผ่อนในที่ที่คุณชอบดูนะ 🤖`;
  } else if (topLocation) {
    return `AI สังเกตว่า: คุณเช็คอินที่ "${topLocation}" บ่อยมากในช่วงนี้ เป็นสถานที่โปรดของคุณใช่ไหม? 📍`;
  } else if (topMood) {
    return `AI สังเกตว่า: ช่วงนี้อารมณ์หลักของคุณคือ "${topMood}" อย่าลืมแชร์เรื่องราวดีๆ ให้เพื่อนๆ ฟังบ้างนะ ✨`;
  } else if (userPosts.length > 2) {
    return `AI กำลังเรียนรู้สิ่งที่คุณสนใจอยู่... โพสต์รูปหรือเช็คอินบ่อยๆ เพื่อให้เรารู้จักคุณมากขึ้น! 🚀`;
  }

  return null;
};
