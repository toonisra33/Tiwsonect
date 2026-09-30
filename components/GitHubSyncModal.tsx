import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Post, User } from '../types';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSyncComplete?: (newPostsCount: number) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSyncComplete
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'guide'>('sync');
  const [sourceType, setSourceType] = useState<'bundled' | 'github_raw' | 'custom_json'>('bundled');
  const [githubUrl, setGithubUrl] = useState<string>('https://raw.githubusercontent.com/toonisra33/tiwsonect/main/data/github_posts.json');
  const [customJson, setCustomJson] = useState<string>('');
  const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadTotal, setUploadTotal] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Default sample posts from data/github_posts.json
  const defaultSamplePosts = [
    {
      id: `gh-${Date.now()}-1`,
      content: '🚀 เปิดตัวระบบ TiWsonect เวอร์ชันใหม่! ซิงค์ข้อมูลจาก GitHub Repository ขึ้นสู่ Cloud Firestore สำเร็จแบบ Real-time พร้อมระบบ AI อัจฉริยะ 🤖✨',
      images: ['https://images.unsplash.com/photo-1618401471353-b98aedd04e11?q=80&w=2000&auto=format&fit=crop'],
      type: 'image',
      mood: 'ตื่นเต้น 🚀',
      locationName: 'GitHub / Cloud Firestore',
      tags: ['github', 'firestore', 'release']
    },
    {
      id: `gh-${Date.now()}-2`,
      content: '💡 เทคนิคการเชื่อมต่อ GitHub CI/CD กับ Cloud Firestore เพื่ออัปเดตกฎความปลอดภัย Security Rules และข้อมูลเริ่มต้น (Seed Data) โดยอัตโนมัติทุกครั้งที่ git push 💻🔥',
      images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop'],
      type: 'image',
      mood: 'มีสาระ 💡',
      locationName: 'Developer Hub',
      tags: ['cicd', 'devops', 'firebase']
    },
    {
      id: `gh-${Date.now()}-3`,
      content: '🌟 สวัสดีชุมชน TiWsonect! โพสต์นี้ถูกดึงข้อมูลตรงมาจากไฟล์ข้อมูลบน GitHub และส่งขึ้นมาแสดงผลบนฟีดของ Cloud Firestore ทันทีครับ!',
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop'],
      type: 'image',
      mood: 'ยินดีที่ได้รู้จัก 👋',
      locationName: 'Bangkok, Thailand',
      tags: ['community', 'welcome']
    },
    {
      id: `gh-${Date.now()}-4`,
      content: '🎬 Short Clip: รีวิวการพัฒนาฟีเจอร์ Social Feed เรียลไทม์ พร้อมระบบ AI ช่วยแต่งแคปชั่นภาษาไทยอัตโนมัติ! ดูคลิปแล้วลองทดสอบได้เลยครับ',
      images: [],
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42845-large.mp4',
      type: 'video',
      mood: 'สนุกสนาน 🎬',
      locationName: 'Tech Studio',
      tags: ['shortclip', 'ai', 'coding']
    },
    {
      id: `gh-${Date.now()}-5`,
      content: '☕ Coffee & Code: เริ่มต้นเช้าวันใหม่ด้วยการเช็ค Pull Request บน GitHub และดูข้อมูลสถิติผู้ใช้งานที่บันทึกลงใน Firestore',
      images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2000&auto=format&fit=crop'],
      type: 'image',
      mood: 'สดชื่น ☕',
      locationName: 'Ari, Bangkok',
      tags: ['coffee', 'lifestyle']
    }
  ];

  const [previewItems, setPreviewItems] = useState<any[]>(defaultSamplePosts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(defaultSamplePosts.map(p => p.id))
  );

  if (!isOpen) return null;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('th-TH');
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleFetchFromGitHub = async () => {
    if (!githubUrl.trim()) return;
    setIsLoadingFetch(true);
    setErrorMessage(null);
    addLog(`กำลังเชื่อมต่อดึงข้อมูลจาก: ${githubUrl}`);

    try {
      const response = await fetch(githubUrl);
      if (!response.ok) {
        throw new Error(`ดึงข้อมูลไม่สำเร็จ HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [data];
      
      const formatted = list.map((item, index) => ({
        id: item.id || `gh-fetched-${Date.now()}-${index}`,
        content: item.content || item.body || item.title || 'ไม่มีเนื้อหา',
        images: item.images || (item.imageUrl ? [item.imageUrl] : []),
        videoUrl: item.videoUrl || null,
        type: item.type || (item.videoUrl ? 'video' : 'image'),
        mood: item.mood || 'GitHub 🌐',
        locationName: item.locationName || 'GitHub Repository',
        tags: item.tags || ['github']
      }));

      setPreviewItems(formatted);
      setSelectedIds(new Set(formatted.map(i => i.id)));
      addLog(`✅ ดึงข้อมูลสำเร็จ: พบทั้งหมด ${formatted.length} รายการ`);
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถดึงข้อมูลจาก URL นี้ได้');
      addLog(`❌ เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsLoadingFetch(false);
    }
  };

  const handleParseCustomJson = () => {
    try {
      const parsed = JSON.parse(customJson);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      setPreviewItems(list);
      setSelectedIds(new Set(list.map((_, i) => `custom-${i}`)));
      setErrorMessage(null);
      addLog(`✅ โหลดข้อมูล JSON เองสำเร็จ: ${list.length} รายการ`);
    } catch (e: any) {
      setErrorMessage('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบวงเล็บและเครื่องหมายคำพูด');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(previewItems.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleUploadToFirestore = async () => {
    const itemsToUpload = previewItems.filter(p => selectedIds.has(p.id));
    if (itemsToUpload.length === 0) {
      setErrorMessage('กรุณาเลือกอย่างน้อย 1 รายการเพื่ออัปโหลด');
      return;
    }

    setIsUploading(true);
    setSyncSuccess(false);
    setErrorMessage(null);
    setUploadProgress(0);
    setUploadTotal(itemsToUpload.length);
    setLogs([]);

    addLog(`🚀 เริ่มกระบวนการส่งข้อมูลจาก GitHub ขึ้น Cloud Firestore...`);
    addLog(`📦 จำนวนรายการที่จะอัปโหลด: ${itemsToUpload.length} รายการ`);

    const authorId = currentUser ? currentUser.id : 'admin';
    let successCount = 0;

    for (let i = 0; i < itemsToUpload.length; i++) {
      const item = itemsToUpload[i];
      const docId = `gh-post-${Date.now()}-${i + 1}`;
      
      const payload: Partial<Post> & Record<string, any> = {
        userId: authorId,
        content: item.content,
        images: item.images || [],
        videoUrl: item.videoUrl || null,
        likes: [],
        comments: [],
        savedBy: [],
        timestamp: Date.now() - (i * 1000 * 60 * 5), // spaced out timestamps
        type: item.type || (item.videoUrl ? 'video' : 'image'),
        mood: item.mood || 'GitHub 🌐',
        locationName: item.locationName || 'GitHub Repository',
        source: 'github-sync',
        syncedAt: Date.now()
      };

      try {
        const postRef = doc(db, 'posts', docId);
        await setDoc(postRef, payload, { merge: true });
        successCount++;
        setUploadProgress(successCount);
        addLog(`✅ [${successCount}/${itemsToUpload.length}] อัปโหลดโพสต์ ID: ${docId} สำเร็จ`);
      } catch (err: any) {
        addLog(`⚠️ ล้มเหลวที่โพสต์ ID ${docId}: ${err.message}`);
        console.error('Firestore upload error:', err);
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setSyncSuccess(true);
      addLog(`🎉 เสร็จสิ้นการส่งข้อมูลขึ้น Cloud Firestore รวม ${successCount} โพสต์เรียบร้อย!`);
      if (onSyncComplete) {
        onSyncComplete(successCount);
      }
    } else {
      setErrorMessage('ไม่สามารถบันทึกข้อมูลลง Cloud Firestore ได้ กรุณาตรวจสอบสิทธิ์และการเชื่อมต่อ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-blue-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">ส่งข้อมูลจาก GitHub ขึ้น Cloud Firestore</h2>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full font-medium">
                  CI/CD & Sync Tool
                </span>
              </div>
              <p className="text-xs text-gray-300">
                นำเข้าข้อมูลฟีด โพสต์ สตอรี่ และวิดีโอจาก GitHub สู่ฐานข้อมูลเรียลไทม์
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 space-x-6 text-sm">
          <button 
            onClick={() => setActiveTab('sync')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'sync' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            ⚡ ซิงค์ทันที (One-Click Sync)
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`pb-3 font-semibold transition border-b-2 ${
              activeTab === 'guide' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            🤖 CLI & GitHub Actions CI/CD
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'sync' ? (
            <>
              {/* Step 1: Select Source */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  1. เลือกแหล่งข้อมูลต้นทาง (Data Source)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => {
                      setSourceType('bundled');
                      setPreviewItems(defaultSamplePosts);
                      setSelectedIds(new Set(defaultSamplePosts.map(p => p.id)));
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      sourceType === 'bundled'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>📁 ชุดข้อมูลใน Repo</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      data/github_posts.json (5 รายการแนะนำ)
                    </p>
                  </button>

                  <button
                    onClick={() => setSourceType('github_raw')}
                    className={`p-3 rounded-xl border text-left transition ${
                      sourceType === 'github_raw'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>🌐 ดึงจาก GitHub URL</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Raw JSON หรือ API ของ GitHub
                    </p>
                  </button>

                  <button
                    onClick={() => setSourceType('custom_json')}
                    className={`p-3 rounded-xl border text-left transition ${
                      sourceType === 'custom_json'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>📝 ใส่ JSON โดยตรง</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      วางข้อมูลโพสต์แบบกำหนดเอง
                    </p>
                  </button>
                </div>

                {sourceType === 'github_raw' && (
                  <div className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <input 
                      type="text" 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="ใส่ URL เช่น https://raw.githubusercontent.com/.../posts.json"
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleFetchFromGitHub}
                      disabled={isLoadingFetch}
                      className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      {isLoadingFetch ? 'กำลังดึง...' : 'ดึงข้อมูล'}
                    </button>
                  </div>
                )}

                {sourceType === 'custom_json' && (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={customJson}
                      onChange={(e) => setCustomJson(e.target.value)}
                      placeholder='[{"content": "สวัสดี TiWsonect จาก GitHub!", "tags": ["github", "hello"]}]'
                      className="w-full font-mono text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleParseCustomJson}
                      className="bg-gray-800 hover:bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                    >
                      แปลงและตรวจสอบ JSON
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Preview & Select */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    2. ตัวอย่างข้อมูลที่จะส่งขึ้น Cloud Firestore ({selectedIds.size}/{previewItems.length} รายการ)
                  </label>
                  <div className="flex space-x-2 text-xs">
                    <button onClick={selectAll} className="text-blue-600 hover:underline">เลือกทั้งหมด</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={deselectAll} className="text-gray-500 hover:underline">ยกเลิกทั้งหมด</button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                  {previewItems.map((item, idx) => {
                    const isChecked = selectedIds.has(item.id);
                    return (
                      <div 
                        key={item.id || idx}
                        onClick={() => toggleSelect(item.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start gap-3 ${
                          isChecked 
                            ? 'bg-white border-blue-400 shadow-xs' 
                            : 'bg-white/60 border-gray-200 opacity-60'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} 
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 truncate">
                              {item.locationName || 'GitHub Source'}
                            </span>
                            {item.mood && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.2 rounded">
                                {item.mood}
                              </span>
                            )}
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                              {item.type || 'post'}
                            </span>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{item.content}</p>
                        </div>
                        {item.images && item.images.length > 0 && (
                          <img 
                            src={item.images[0]} 
                            alt="preview" 
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progress and Logs */}
              {isUploading && (
                <div className="space-y-2 bg-blue-50/50 border border-blue-200 p-4 rounded-xl">
                  <div className="flex justify-between text-xs font-semibold text-blue-900">
                    <span>กำลังส่งข้อมูลขึ้น Cloud Firestore...</span>
                    <span>{uploadProgress} / {uploadTotal} รายการ ({Math.round((uploadProgress / uploadTotal) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 transition-all duration-300"
                      style={{ width: `${(uploadProgress / (uploadTotal || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {logs.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">
                    บันทึกการทำงาน (Sync Terminal Log):
                  </label>
                  <div className="bg-gray-900 text-emerald-400 font-mono text-[11px] p-3 rounded-xl max-h-32 overflow-y-auto space-y-1 shadow-inner">
                    {logs.map((log, index) => (
                      <div key={index} className="leading-tight">{log}</div>
                    ))}
                  </div>
                </div>
              )}

              {syncSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🎉</span>
                    <span className="font-semibold">
                      ส่งข้อมูลขึ้น Cloud Firestore สำเร็จแล้ว! ฟีดของคุณได้รับการอัปเดตแบบเรียลไทม์ทันที
                    </span>
                  </div>
                  <button 
                    onClick={onClose}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg text-xs"
                  >
                    ดูฟีดทันที
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}
            </>
          ) : (
            /* Guide Tab */
            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-1">
                  🤖 การส่งข้อมูลขึ้น Cloud Firestore ผ่าน GitHub CI/CD อัตโนมัติ
                </h4>
                <p className="text-blue-800">
                  ระบบได้เตรียมไฟล์สคริปต์และ GitHub Actions Workflow ไว้ในโปรเจกต์นี้เรียบร้อยแล้ว ทุกครั้งที่คุณ Push โค้ดหรืออัปเดตไฟล์ในโฟลเดอร์ <code className="bg-white px-1 py-0.5 rounded border border-blue-300 text-blue-900 font-mono">data/</code> ข้อมูลจะถูกส่งขึ้น Firestore ทันที!
                </p>
              </div>

              <div>
                <h5 className="font-bold text-gray-900 mb-1.5">วิธีที่ 1: รันคำสั่งผ่านเทอร์มินัล (Command Line)</h5>
                <p className="text-gray-600 mb-2">รันคำสั่งซิงค์ข้อมูลจากไฟล์ในโปรเจกต์ขึ้น Cloud Firestore ได้โดยตรง:</p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  npm run sync:github
                </div>
              </div>

              <div>
                <h5 className="font-bold text-gray-900 mb-1.5">วิธีที่ 2: ตั้งค่า GitHub Actions (CI/CD)</h5>
                <p className="text-gray-600 mb-2">
                  ไฟล์ workflow ถูกสร้างไว้ที่ <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">.github/workflows/sync-firestore.yml</code>
                </p>
                <div className="bg-gray-900 text-gray-200 p-3 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto">
                  <div className="text-gray-400"># รันเมื่อมีการ Push ข้อมูลขึ้นกิ่ง main</div>
                  <div>git add data/ .github/</div>
                  <div>git commit -m &quot;feat: update seed posts from GitHub&quot;</div>
                  <div>git push origin main</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <h5 className="font-bold text-gray-900 mb-1">ข้อมูลความปลอดภัย:</h5>
                <p className="text-gray-500 text-[11px]">
                  กฎ Firestore Security Rules (<code className="font-mono">firestore.rules</code>) ได้รับการตรวจสอบและอนุญาตให้เข้าถึงตามหลักความปลอดภัย Zero-Trust สามารถตรวจสอบได้ที่ไฟล์ <code className="font-mono">security_spec.md</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="text-xs text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>

          {activeTab === 'sync' && (
            <button
              onClick={handleUploadToFirestore}
              disabled={isUploading || selectedIds.size === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center space-x-2"
            >
              <span>{isUploading ? 'กำลังอัปโหลด...' : `ส่ง ${selectedIds.size} รายการขึ้น Firestore 🚀`}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
