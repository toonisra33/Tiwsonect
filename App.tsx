
import React, { useState, useEffect } from 'react';
import { Post, User, Message, ViewState, Notification, LiveSession } from './types';
import { MOCK_USERS, ICONS, CURRENT_USER_ID } from './constants';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { Chat } from './components/Chat';
import { Nearby } from './components/Nearby';
import { CreatePost } from './components/CreatePost';
import { NotificationDropdown } from './components/NotificationDropdown';
import { Registration, RegistrationData } from './components/Registration';
import { Profile } from './components/Profile';
import { ShortClips } from './components/ShortClips';
import { analyzeUserBehavior } from './services/learningAlgorithm';
import { SearchResults } from './components/SearchResults';
import { LiveBroadcaster } from './components/LiveBroadcaster';
import { LiveViewer } from './components/LiveViewer';

// Firebase Imports
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, arrayUnion, arrayRemove, doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  // BYPASS AUTH: Initialize with Mock User immediately for design purposes
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(MOCK_USERS.find(u => u.id === CURRENT_USER_ID) || MOCK_USERS[3]);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false); // Disable loading

  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Initialize with MOCK USERS so the app isn't empty
  const [users, setUsers] = useState<User[]>(MOCK_USERS); 
  
  // Initialize with MOCK POSTS so the Feed isn't empty while designing
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      userId: 'u1',
      content: 'วันนี้อากาศดีมาก! ☀️ ไปวิ่งสวนลุมมาครับ ใครว่างมาเจอกันได้นะ',
      images: ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2073&auto=format&fit=crop'],
      likes: ['u2', 'me'],
      comments: [],
      timestamp: Date.now() - 3600000,
      type: 'image',
      mood: 'สดชื่น 🌿',
      locationName: 'สวนลุมพินี',
      savedBy: []
    },
    {
      id: 'p2',
      userId: 'u2',
      content: 'Cafe hopping day! กาแฟอร่อยมาก ☕️ ร้านนี้มุมถ่ายรูปเยอะสุดๆ',
      images: [
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=1974&auto=format&fit=crop'
      ],
      likes: ['u1', 'u3', 'me'],
      comments: [{ id: 'c1', userId: 'u1', text: 'ร้านสวยมากครับ', timestamp: Date.now() }],
      timestamp: Date.now() - 7200000,
      type: 'image',
      mood: 'มีความสุข 🥰',
      locationName: 'Siam Paragon',
      savedBy: []
    },
    {
      id: 'p3',
      userId: 'admin',
      content: 'ประกาศ: ระบบ Live Streaming เปิดให้ใช้งานแล้ววันนี้! 🔴\nกดปุ่ม "+" แล้วเลือก "ถ่ายทอดสด" เพื่อเริ่มไลฟ์ได้เลย',
      likes: [],
      comments: [],
      timestamp: Date.now(),
      type: 'text',
      isBroadcast: true,
      broadcastExpiresAt: Date.now() + 1800000, // 30 mins
      savedBy: []
    }
  ]);
  
  const [activeLiveSessions, setActiveLiveSessions] = useState<LiveSession[]>([
    {
       id: 'live-u2',
       userId: 'u2',
       title: 'Cafe Hopping BKK ☕️',
       viewerCount: 1240,
       isActive: true,
       startedAt: Date.now() - 600000
    }
  ]);
  const [currentLiveSession, setCurrentLiveSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'u1', receiverId: 'me', text: 'สวัสดีครับ ว่างไหม?', timestamp: Date.now() - 100000, isRead: false },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Auth Listener (Kept but modified to not block UI)
  useEffect(() => {
    try {
      if (!auth) {
        setIsLoadingAuth(false);
        console.warn("Firebase auth is null, running in Offline Design Mode");
        return;
      }
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFirebaseUser(user);
          // Fetch User Profile from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                setCurrentUserProfile(userDoc.data() as User);
            }
          } catch (e) { console.log('Firestore user fetch failed, using mock'); }
        }
        setIsLoadingAuth(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase Auth not configured or failed, running in Offline Design Mode");
      setIsLoadingAuth(false);
    }
  }, []);

  // 2. Sync Posts from Firestore (Optional - only if connected)
  useEffect(() => {
    if (!firebaseUser || !db) return;
    try {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
          setPosts(fetchedPosts);
      }, (err) => {
        console.warn("Firestore posts sync failed (likely permission/key issue). Using Mock Data.");
      });
      return () => unsubscribe();
    } catch (e) { console.log("Offline mode: Posts"); }
  }, [firebaseUser]);

  // 3. Sync Users from Firestore (Optional)
  useEffect(() => {
    if (!firebaseUser || !db) return;
    try {
      const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
          const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          if (fetchedUsers.length > 0) {
              setUsers(fetchedUsers);
          }
      }, (err) => {
         console.warn("Firestore users sync failed. Using Mock Data.");
      });
      return () => unsubscribe();
    } catch (e) { console.log("Offline mode: Users"); }
  }, [firebaseUser]);

  const unreadMessageCount = messages.filter(m => currentUserProfile && m.receiverId === currentUserProfile.id && !m.isRead).length;
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // AI Insight Effect
  useEffect(() => {
    if (currentUserProfile) {
        const insight = analyzeUserBehavior(posts, currentUserProfile.id);
        if (insight) setAiInsight(insight);
    }
  }, [posts, currentUserProfile]);

  // Handlers
  const handleLike = async (postId: string) => {
    if (!currentUserProfile) return;
    
    // Optimistic UI Update
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            const isLiked = p.likes.includes(currentUserProfile.id);
            return {
                ...p,
                likes: isLiked ? p.likes.filter(id => id !== currentUserProfile.id) : [...p.likes, currentUserProfile.id]
            };
        }
        return p;
    }));

    // Try Firestore update
    try {
        const post = posts.find(p => p.id === postId);
        if (post && firebaseUser && db) {
             const postRef = doc(db, "posts", postId);
             if (post.likes.includes(currentUserProfile.id)) {
                 await updateDoc(postRef, { likes: arrayRemove(currentUserProfile.id) });
             } else {
                 await updateDoc(postRef, { likes: arrayUnion(currentUserProfile.id) });
             }
        }
    } catch(e) { console.log("Offline like"); }
  };

  const handleSavePost = async (postId: string) => {
    if (!currentUserProfile) return;

    // Optimistic UI Update
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            const isSaved = p.savedBy?.includes(currentUserProfile.id);
            return {
                ...p,
                savedBy: isSaved ? p.savedBy?.filter(id => id !== currentUserProfile.id) : [...(p.savedBy || []), currentUserProfile.id]
            };
        }
        return p;
    }));

    try {
        const post = posts.find(p => p.id === postId);
        if (post && firebaseUser && db) {
            const postRef = doc(db, "posts", postId);
            const isSaved = post.savedBy?.includes(currentUserProfile.id);
            if (isSaved) {
                await updateDoc(postRef, { savedBy: arrayRemove(currentUserProfile.id) });
            } else {
                await updateDoc(postRef, { savedBy: arrayUnion(currentUserProfile.id) });
            }
        }
    } catch(e) { console.log("Offline save"); }
  };

  const handleComment = async (postId: string, text: string) => {
    if (!currentUserProfile) return;
    const newComment = { id: `c-${Date.now()}`, userId: currentUserProfile.id, text, timestamp: Date.now() };
    
    // Optimistic
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return { ...p, comments: [...p.comments, newComment] };
        }
        return p;
    }));

    try {
        if(firebaseUser && db) {
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, { comments: arrayUnion(newComment) });
        }
    } catch(e) { console.log("Offline comment"); }
  };

  const handleCreatePost = async (content: string, mediaPreviews?: string[], type: 'image' | 'video' | 'short_video' = 'image', isBroadcast: boolean = false, mood?: string, locationName?: string) => {
    if (!currentUserProfile) return;
    
    const newPost: Post = {
        id: `new-${Date.now()}`,
        userId: currentUserProfile.id,
        content,
        images: type === 'image' ? mediaPreviews : undefined,
        video: (type === 'video' || type === 'short_video') ? (mediaPreviews?.[0]) : undefined,
        likes: [],
        savedBy: [],
        comments: [],
        timestamp: Date.now(),
        type: (mediaPreviews && mediaPreviews.length > 0) ? type : 'text',
        isBroadcast,
        broadcastExpiresAt: isBroadcast ? Date.now() + (30 * 60 * 1000) : undefined,
        mood: mood || undefined,
        locationName: locationName || undefined
    };

    setPosts(prev => [newPost, ...prev]);

    try {
        if(firebaseUser && db) {
            await addDoc(collection(db, "posts"), {
                ...newPost,
                // Ensure undefined values are null for Firestore
                mood: mood || null,
                locationName: locationName || null,
                images: mediaPreviews || null,
                video: (type !== 'image' && mediaPreviews?.[0]) || null
            });
        }
    } catch(e) { console.log("Offline create post"); }

    setView(ViewState.FEED);
  };

  const handleSendMessage = (receiverId: string, text: string, isAiReply = false) => {
     if (!currentUserProfile) return;
     const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: isAiReply ? receiverId : currentUserProfile.id,
      receiverId: isAiReply ? currentUserProfile.id : receiverId,
      text,
      timestamp: Date.now(),
      isRead: !isAiReply 
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error(err)
      );
    }
  };

  // Nav Handlers
  const handleGoLive = () => setView(ViewState.LIVE_HOST);
  const handleJoinLive = (sessionId: string) => {
     const session = activeLiveSessions.find(s => s.id === sessionId);
     if (session) {
        setCurrentLiveSession(session);
        setView(ViewState.LIVE_VIEW);
     }
  };
  const handleEndLive = () => setView(ViewState.FEED);
  const handleSetView = (newView: ViewState) => {
    setView(newView);
    setIsSearchOpen(false);
    setSearchQuery('');
  };
  const handleLogout = () => {
      // For mock, just refresh usually, but here we can set user to null
      if (auth) {
        signOut(auth).catch(() => {});
      }
      window.location.reload(); 
  };

  // Render logic
  if (isLoadingAuth) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">กำลังโหลด...</div>;
  }

  // NOTE: Bypass Registration check for Design Mode
  // if (!firebaseUser || !currentUserProfile) { ... } 
  
  // Ensure we have a profile to render (fallback to mock 'me')
  const activeUser = currentUserProfile || MOCK_USERS.find(u => u.id === CURRENT_USER_ID)!;

  if (view === ViewState.LIVE_HOST) return <LiveBroadcaster onEndLive={handleEndLive} />;
  if (view === ViewState.LIVE_VIEW && currentLiveSession) {
      const host = users.find(u => u.id === currentLiveSession.userId) || users[0];
      return <LiveViewer session={currentLiveSession} hostUser={host} onLeave={() => setView(ViewState.FEED)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {view !== ViewState.CHAT && (
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center z-40 shadow-sm relative h-[72px]">
            {isSearchOpen ? (
                <div className="flex-1 flex items-center space-x-2 animate-fade-in">
                    <input 
                       type="text" autoFocus placeholder="ค้นหาผู้ใช้ หรือ โพสต์..." 
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-gray-500 text-sm font-medium">ยกเลิก</button>
                </div>
            ) : (
                <>
                  <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                          <span className="text-white font-extrabold text-xl tracking-tighter">T</span>
                      </div>
                      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">TiWsonect</h1>
                  </div>
                  <div className="flex space-x-3">
                      <button 
                         className="text-red-600 hover:text-red-700 transition p-1"
                         onClick={() => setView(ViewState.LIVE_HOST)}
                         title="Go Live"
                      >
                         {ICONS.Live}
                      </button>
                      <button className="text-gray-600 hover:text-blue-600 transition p-1" onClick={() => setIsSearchOpen(true)}>{ICONS.Search}</button>
                      <button className="relative text-gray-600 hover:text-blue-600 transition p-1" onClick={() => setShowNotifications(!showNotifications)}>
                          {ICONS.Heart}
                          {unreadNotificationCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{unreadNotificationCount}</span>}
                      </button>
                      <button className="relative text-gray-600 hover:text-blue-600 transition p-1" onClick={() => setView(ViewState.CHAT)}>
                          {ICONS.Chat}
                          {unreadMessageCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{unreadMessageCount}</span>}
                      </button>
                  </div>
                </>
            )}
            {showNotifications && (
              <NotificationDropdown notifications={notifications} users={users} onClose={() => setShowNotifications(false)} onMarkAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))} />
            )}
        </header>
      )}

      <main className="flex-1 max-w-2xl w-full mx-auto">
        {isSearchOpen && searchQuery ? (
             <SearchResults query={searchQuery} users={users} posts={posts} onLike={handleLike} onComment={handleComment} onSave={handleSavePost} />
        ) : (
             <>
                {view === ViewState.FEED && (
                    <Feed 
                      posts={posts} users={users} 
                      onLike={handleLike} onComment={handleComment} onSave={handleSavePost}
                      aiInsight={aiInsight} onClearInsight={() => setAiInsight(null)}
                      activeLiveSessions={activeLiveSessions} onJoinLive={handleJoinLive}
                    />
                )}
                {view === ViewState.EXPLORE_NEARBY && <Nearby users={users} currentUserLocation={currentUserLocation} onRequestLocation={requestLocation} />}
                {view === ViewState.CHAT && <Chat users={users} messages={messages} onSendMessage={handleSendMessage} />}
                {view === ViewState.PROFILE && <Profile user={activeUser} isCurrentUser={true} posts={posts} />}
                {view === ViewState.SHORT_CLIPS && <ShortClips posts={posts} users={users} onLike={handleLike} />}
             </>
        )}
      </main>

      {view === ViewState.CREATE_POST && (
          <CreatePost onClose={() => setView(ViewState.FEED)} onSubmit={handleCreatePost} onGoLive={handleGoLive} />
      )}

      {view !== ViewState.CHAT && view !== ViewState.SHORT_CLIPS && (
         <Navigation currentView={view} setView={handleSetView} unreadChatCount={unreadMessageCount} />
      )}
      {view === ViewState.SHORT_CLIPS && (
         <div className="fixed bottom-0 left-0 right-0 z-50">
             <Navigation currentView={view} setView={handleSetView} unreadChatCount={unreadMessageCount} />
         </div>
      )}
    </div>
  );
};

export default App;
