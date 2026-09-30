import React, { useState, useEffect } from 'react';
import { Post, User, Message, ViewState, Notification, LiveSession } from './types';
import { MOCK_USERS, ICONS, CURRENT_USER_ID } from './constants';
import { Navigation } from './components/Navigation';
import { Feed } from './components/Feed';
import { Chat } from './components/Chat';
import { Nearby } from './components/Nearby';
import { CreatePost } from './components/CreatePost';
import { NotificationDropdown } from './components/NotificationDropdown';
import { Registration } from './components/Registration';
import { Profile } from './components/Profile';
import { ShortClips } from './components/ShortClips';
import { analyzeUserBehavior } from './services/learningAlgorithm';
import { SearchResults } from './components/SearchResults';
import { LiveBroadcaster } from './components/LiveBroadcaster';
import { LiveViewer } from './components/LiveViewer';

// Firebase Imports
import { auth, db, handleFirestoreError, OperationType } from './firebaseConfig';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

const App: React.FC = () => {
  // Current user state
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    MOCK_USERS.find(u => u.id === CURRENT_USER_ID) || MOCK_USERS[3]
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);

  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Users state
  const [users, setUsers] = useState<User[]>(MOCK_USERS); 
  
  // Posts state initialized with mock and then synced with Firestore
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
      content: 'ประกาศ: เชื่อมต่อ Cloud Firestore เรียบร้อยแล้ว! 🚀 ข้อมูลทั้งหมดถูกจัดเก็บและซิงค์แบบเรียลไทม์',
      likes: ['me'],
      comments: [],
      timestamp: Date.now(),
      type: 'text',
      isBroadcast: true,
      broadcastExpiresAt: Date.now() + 1800000,
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

  // 1. Auth Listener
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFirebaseUser(user);
          setShowAuthModal(false);
          // Fetch or initialize User Profile in Firestore
          try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setCurrentUserProfile(userDoc.data() as User);
            } else {
              const newProfile: User = {
                id: user.uid,
                name: user.displayName || 'ผู้ใช้ TiWsonect',
                email: user.email || '',
                avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`,
                bio: 'สมาชิกใหม่ TiWsonect',
                isOnline: true,
                coverPhoto: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1200&auto=format&fit=crop',
                stats: { posts: 0, followers: 0, following: 0 }
              };
              await setDoc(userRef, newProfile);
              setCurrentUserProfile(newProfile);
            }
          } catch (e) {
            console.error("Firestore user profile fetch error:", e);
          }
        } else {
          setFirebaseUser(null);
        }
        setIsLoadingAuth(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth initialization notice:", e);
      setIsLoadingAuth(false);
    }
  }, []);

  // 2. Sync Posts from Cloud Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
          setPosts(fetchedPosts);
          setIsFirestoreConnected(true);
        }
      }, (err) => {
        console.warn("Firestore posts listener error:", err.message);
      });
      return () => unsubscribe();
    } catch (e) {
      console.log("Firestore posts offline fallback");
    }
  }, []);

  // 3. Sync Users from Cloud Firestore
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        if (!snapshot.empty) {
          const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          setUsers(prev => {
            const map = new Map<string, User>();
            prev.forEach(u => map.set(u.id, u));
            fetchedUsers.forEach(u => map.set(u.id, u));
            return Array.from(map.values());
          });
        }
      }, (err) => {
        console.warn("Firestore users listener note:", err.message);
      });
      return () => unsubscribe();
    } catch (e) {
      console.log("Firestore users offline fallback");
    }
  }, []);

  // 4. Sync Messages from Cloud Firestore
  useEffect(() => {
    if (!firebaseUser) return;
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
          setMessages(fetchedMsgs);
        }
      }, (err) => {
        console.warn("Firestore messages listener error:", err.message);
      });
      return () => unsubscribe();
    } catch (e) {
      console.log("Messages offline fallback");
    }
  }, [firebaseUser]);

  // 5. Sync Live Sessions from Cloud Firestore
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "liveSessions"), (snapshot) => {
        if (!snapshot.empty) {
          const fetchedSessions = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as LiveSession))
            .filter(s => s.isActive);
          if (fetchedSessions.length > 0) {
            setActiveLiveSessions(fetchedSessions);
          }
        }
      }, () => {});
      return () => unsubscribe();
    } catch (e) {}
  }, []);

  const unreadMessageCount = messages.filter(m => currentUserProfile && m.receiverId === currentUserProfile.id && !m.isRead).length;
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // AI Insight Effect
  useEffect(() => {
    if (currentUserProfile) {
      const insight = analyzeUserBehavior(posts, currentUserProfile.id);
      if (insight) setAiInsight(insight);
    }
  }, [posts, currentUserProfile]);

  // Handlers with Firestore writes
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

    // Firestore Update
    if (firebaseUser) {
      try {
        const post = posts.find(p => p.id === postId);
        const postRef = doc(db, "posts", postId);
        if (post && post.likes.includes(currentUserProfile.id)) {
          await updateDoc(postRef, { likes: arrayRemove(currentUserProfile.id) });
        } else {
          await updateDoc(postRef, { likes: arrayUnion(currentUserProfile.id) });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
      }
    }
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

    if (firebaseUser) {
      try {
        const post = posts.find(p => p.id === postId);
        const postRef = doc(db, "posts", postId);
        const isSaved = post?.savedBy?.includes(currentUserProfile.id);
        if (isSaved) {
          await updateDoc(postRef, { savedBy: arrayRemove(currentUserProfile.id) });
        } else {
          await updateDoc(postRef, { savedBy: arrayUnion(currentUserProfile.id) });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
      }
    }
  };

  const handleComment = async (postId: string, text: string) => {
    if (!currentUserProfile) return;
    const newComment = { id: `c-${Date.now()}`, userId: currentUserProfile.id, text, timestamp: Date.now() };
    
    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));

    if (firebaseUser) {
      try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, { comments: arrayUnion(newComment) });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
      }
    }
  };

  const handleCreatePost = async (
    content: string, 
    mediaPreviews?: string[], 
    type: 'image' | 'video' | 'short_video' = 'image', 
    isBroadcast: boolean = false, 
    mood?: string, 
    locationName?: string
  ) => {
    if (!currentUserProfile) return;
    
    const postData: Omit<Post, 'id'> = {
      userId: currentUserProfile.id,
      content,
      images: type === 'image' ? (mediaPreviews || []) : [],
      video: (type === 'video' || type === 'short_video') ? (mediaPreviews?.[0] || '') : '',
      likes: [],
      savedBy: [],
      comments: [],
      timestamp: Date.now(),
      type: (mediaPreviews && mediaPreviews.length > 0) ? type : 'text',
      isBroadcast,
      broadcastExpiresAt: isBroadcast ? Date.now() + (30 * 60 * 1000) : undefined,
      mood: mood || '',
      locationName: locationName || ''
    };

    // Optimistic
    const tempPost: Post = { id: `temp-${Date.now()}`, ...postData };
    setPosts(prev => [tempPost, ...prev]);

    // Firestore write
    if (firebaseUser) {
      try {
        const docRef = await addDoc(collection(db, "posts"), postData);
        setPosts(prev => prev.map(p => p.id === tempPost.id ? { ...p, id: docRef.id } : p));
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, "posts");
      }
    }

    setView(ViewState.FEED);
  };

  const handleSendMessage = async (receiverId: string, text: string, isAiReply = false) => {
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

    if (firebaseUser && !isAiReply) {
      try {
        await addDoc(collection(db, "messages"), newMsg);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, "messages");
      }
    }
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setCurrentUserProfile(MOCK_USERS[3]);
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-blue-600 font-bold gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">กำลังเชื่อมต่อกับ Cloud Firestore...</p>
      </div>
    );
  }

  const activeUser = currentUserProfile || MOCK_USERS[3];

  if (view === ViewState.LIVE_HOST) return <LiveBroadcaster onEndLive={handleEndLive} />;
  if (view === ViewState.LIVE_VIEW && currentLiveSession) {
    const host = users.find(u => u.id === currentLiveSession.userId) || users[0];
    return <LiveViewer session={currentLiveSession} hostUser={host} onLeave={() => setView(ViewState.FEED)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Auth Modal if triggered */}
      {showAuthModal && (
        <Registration 
          onContinueAsGuest={() => setShowAuthModal(false)}
        />
      )}

      {view !== ViewState.CHAT && (
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-3.5 flex justify-between items-center z-40 shadow-sm relative min-h-[64px]">
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
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <span className="text-white font-extrabold text-xl tracking-tighter">T</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-lg font-extrabold tracking-tight text-gray-900 leading-tight">TiWsonect</h1>
                    <span 
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isFirestoreConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                      title={isFirestoreConnected ? "เชื่อมต่อกับ Cloud Firestore สำเร็จแล้ว" : "โหมดออฟไลน์"}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                      Firestore
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-none">
                    {firebaseUser ? (
                      <span className="text-emerald-700">เข้าสู่ระบบแล้ว ({firebaseUser.displayName || firebaseUser.email})</span>
                    ) : (
                      <span>โหมดทดลองใช้งาน</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!firebaseUser ? (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    เข้าสู่ระบบ
                  </button>
                ) : (
                  <button 
                    onClick={handleLogout}
                    title="ออกจากระบบ"
                    className="text-xs text-gray-500 hover:text-red-600 font-medium px-2 py-1 rounded transition"
                  >
                    ออก
                  </button>
                )}

                <button 
                  className="text-red-600 hover:text-red-700 transition p-1.5"
                  onClick={() => setView(ViewState.LIVE_HOST)}
                  title="เริ่มถ่ายทอดสด"
                >
                  {ICONS.Live}
                </button>
                <button className="text-gray-600 hover:text-blue-600 transition p-1.5" onClick={() => setIsSearchOpen(true)}>{ICONS.Search}</button>
                <button className="relative text-gray-600 hover:text-blue-600 transition p-1.5" onClick={() => setShowNotifications(!showNotifications)}>
                  {ICONS.Heart}
                  {unreadNotificationCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{unreadNotificationCount}</span>}
                </button>
                <button className="relative text-gray-600 hover:text-blue-600 transition p-1.5" onClick={() => setView(ViewState.CHAT)}>
                  {ICONS.Chat}
                  {unreadMessageCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{unreadMessageCount}</span>}
                </button>
              </div>
            </>
          )}
          {showNotifications && (
            <NotificationDropdown 
              notifications={notifications} 
              users={users} 
              onClose={() => setShowNotifications(false)} 
              onMarkAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))} 
            />
          )}
        </header>
      )}

      <main className="flex-1 max-w-2xl w-full mx-auto pb-16">
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
