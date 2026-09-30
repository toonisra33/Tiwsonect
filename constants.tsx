
import React from 'react';
import { 
  Home, 
  MapPin, 
  MessageCircle, 
  User, 
  Heart, 
  Send, 
  Image as ImageIcon, 
  PlusSquare, 
  MoreHorizontal,
  Share2,
  Smile,
  Search,
  Video,
  Radio,
  Plus,
  Globe,
  Lock,
  Users,
  Camera,
  Edit3,
  Briefcase,
  GraduationCap,
  Grid,
  Info,
  Bookmark,
  Clapperboard,
  Mic,
  Wand2,
  Sparkles,
  Palette,
  Ghost
} from 'lucide-react';

export const ICONS = {
  Home: <Home className="w-6 h-6" />,
  Map: <MapPin className="w-6 h-6" />,
  Chat: <MessageCircle className="w-6 h-6" />,
  Profile: <User className="w-6 h-6" />,
  Heart: <Heart className="w-5 h-5" />,
  HeartFilled: <Heart className="w-5 h-5 fill-red-500 text-red-500" />,
  Comment: <MessageCircle className="w-5 h-5" />,
  Share: <Share2 className="w-5 h-5" />,
  Add: <PlusSquare className="w-6 h-6" />,
  Image: <ImageIcon className="w-5 h-5" />,
  Video: <Video className="w-5 h-5" />,
  More: <MoreHorizontal className="w-5 h-5" />,
  Send: <Send className="w-5 h-5" />,
  Smile: <Smile className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Broadcast: <Radio className="w-5 h-5" />,
  PlusSmall: <Plus className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Camera: <Camera className="w-5 h-5" />,
  Edit: <Edit3 className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  School: <GraduationCap className="w-5 h-5" />,
  Grid: <Grid className="w-5 h-5" />,
  Info: <Info className="w-5 h-5" />,
  Bookmark: <Bookmark className="w-5 h-5" />,
  BookmarkFilled: <Bookmark className="w-5 h-5 fill-blue-600 text-blue-600" />,
  Clapperboard: <Clapperboard className="w-6 h-6" />,
  Live: <Radio className="w-6 h-6" />,
  Mic: <Mic className="w-5 h-5" />,
  Beauty: <Wand2 className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Palette: <Palette className="w-5 h-5" />,
  Ghost: <Ghost className="w-5 h-5" />
};

export const MOODS = [
  { label: 'มีความสุข', emoji: '🤩' },
  { label: 'ตื่นเต้น', emoji: '😆' },
  { label: 'เศร้า', emoji: '😢' },
  { label: 'เบื่อ', emoji: '😒' },
  { label: 'ง่วง', emoji: '😴' },
  { label: 'รักเลย', emoji: '🥰' },
  { label: 'เหนื่อย', emoji: '😫' },
  { label: 'โกรธ', emoji: '😡' },
];

export const LOCATIONS = [
  'สยามพารากอน',
  'เซ็นทรัลเวิลด์',
  'ไอคอนสยาม',
  'สวนลุมพินี',
  'ตลาดจตุจักร',
  'เยาวราช',
  'ทองหล่อ',
  'เชียงใหม่',
  'ภูเก็ต'
];

export const MOCK_USERS = [
  { 
    id: 'u1', 
    name: 'คุณสมชาย', 
    avatar: 'https://picsum.photos/seed/u1/100/100', 
    location: { lat: 13.7563, lng: 100.5018 }, 
    isOnline: true, 
    hasStory: true,
    coverPhoto: 'https://picsum.photos/seed/cover1/800/300',
    bio: 'รักธรรมชาติ ชอบท่องเที่ยว 🏞️',
    stats: { posts: 45, followers: 120, following: 80 }
  },
  { 
    id: 'u2', 
    name: 'น้องพลอย', 
    avatar: 'https://picsum.photos/seed/u2/100/100', 
    location: { lat: 13.7200, lng: 100.5200 }, 
    isOnline: false, 
    hasStory: false,
    coverPhoto: 'https://picsum.photos/seed/cover2/800/300',
    bio: 'Lifestyle & Cafe Hopping ☕️',
    stats: { posts: 120, followers: 3500, following: 150 }
  },
  { 
    id: 'u3', 
    name: 'เจมส์ (AI)', 
    avatar: 'https://picsum.photos/seed/u3/100/100', 
    location: { lat: 13.8000, lng: 100.5500 }, 
    isOnline: true, 
    hasStory: false,
    coverPhoto: 'https://picsum.photos/seed/cover3/800/300',
    bio: 'AI Assistant พร้อมช่วยเหลือครับ 🤖',
    stats: { posts: 0, followers: 9999, following: 0 }
  },
  { 
    id: 'me', 
    name: 'ฉันเอง', 
    avatar: 'https://picsum.photos/seed/me/100/100', 
    location: { lat: 13.7400, lng: 100.5600 }, 
    isOnline: true, 
    hasStory: false,
    coverPhoto: 'https://picsum.photos/seed/coverMe/800/300',
    bio: 'Developer | Coding is life 💻\nชอบกินกาแฟและนอนดึก',
    stats: { posts: 12, followers: 254, following: 180 }
  },
  { 
    id: 'admin', 
    name: 'ผู้ดูแลระบบ', 
    avatar: 'https://picsum.photos/seed/admin/100/100', 
    location: { lat: 0, lng: 0 }, 
    isOnline: true, 
    hasStory: false,
    coverPhoto: 'https://picsum.photos/seed/coverAdmin/800/300',
    stats: { posts: 999, followers: 10000, following: 0 }
  },
];

export const CURRENT_USER_ID: string = 'me';

export const MOCK_LIVE_COMMENTS = [
  "สวัสดีครับ 👋",
  "ภาพชัดมากเลย",
  "ทำอะไรอยู่ครับ?",
  "ขอเพลงหน่อย 🎵",
  "น่ารักมากครับ 🥰",
  "หวัดดีจ้า",
  "Live ที่ไหนครับเนี่ย",
  "Fc ครับผม ❤️",
  "กินข้าวยัง?",
  "เสียงเบาไปนิดนึง",
  "55555+"
];
