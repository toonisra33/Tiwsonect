
import React, { useState, useRef } from 'react';
import { ICONS, CURRENT_USER_ID, MOODS, LOCATIONS } from '../constants';
import { generateCaptionEnhancement } from '../services/geminiService';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface CreatePostProps {
  onClose: () => void;
  onSubmit: (content: string, media?: string[], type?: 'image' | 'video' | 'short_video', isBroadcast?: boolean, mood?: string, locationName?: string) => void;
  onGoLive: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSubmit, onGoLive }) => {
  const [text, setText] = useState('');
  
  // Store actual Files for upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Store Previews for UI
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'short_video'>('image');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // New States for Mood and Location
  const [selectedMood, setSelectedMood] = useState<string | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const isAdmin = (CURRENT_USER_ID as string) === 'admin'; 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (type === 'video') {
       if (files.length > 1) {
         alert('สามารถอัปโหลดวิดีโอได้เพียง 1 ไฟล์เท่านั้น');
         return;
       }
       const file = files[0];
       setSelectedFiles([file]);

       const reader = new FileReader();
       reader.onloadend = () => {
         const result = reader.result as string;
         setMediaPreviews([result]);
         
         const tempVideo = document.createElement('video');
         tempVideo.preload = 'metadata';
         tempVideo.onloadedmetadata = () => {
            window.URL.revokeObjectURL(tempVideo.src);
            const duration = tempVideo.duration;
            const width = tempVideo.videoWidth;
            const height = tempVideo.videoHeight;
            const aspectRatio = width / height;

            const isVertical = aspectRatio < 0.6; // Roughly 9:16
            const isShortDuration = duration <= 70;

            if (isVertical && isShortDuration) {
               setMediaType('short_video');
            } else {
               setMediaType('video');
            }
          };
          tempVideo.src = URL.createObjectURL(file);
       };
       reader.readAsDataURL(file);
       return;
    }

    if (type === 'image') {
        if (mediaPreviews.length + files.length > 50) {
            alert('คุณสามารถเลือกรูปภาพได้สูงสุด 50 รูปต่อ 1 โพสต์');
            return;
        }

        setSelectedFiles(prev => [...prev, ...files]);

        const newPreviews: string[] = [];
        let processedCount = 0;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                processedCount++;
                if (processedCount === files.length) {
                    setMediaType('image');
                    setMediaPreviews(prev => (mediaType === 'video' ? [...newPreviews] : [...prev, ...newPreviews]));
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeMedia = (index: number) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (mediaPreviews.length <= 1) {
        setMediaType('image');
    }
  };

  const handleEnhance = async () => {
    if (!text) return;
    setIsEnhancing(true);
    const enhanced = await generateCaptionEnhancement(text);
    setText(enhanced);
    setIsEnhancing(false);
  };

  const handlePost = async () => {
    setIsUploading(true);
    
    try {
        let uploadedUrls: string[] = [];
        
        // Upload Files to Firebase Storage
        if (selectedFiles.length > 0) {
            if (storage) {
                const uploadPromises = selectedFiles.map(async (file) => {
                    const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
                    const snapshot = await uploadBytes(storageRef, file);
                    return await getDownloadURL(snapshot.ref);
                });
                uploadedUrls = await Promise.all(uploadPromises);
            } else {
                // Fallback to data URLs for design mode
                uploadedUrls = [...mediaPreviews];
            }
        }

        onSubmit(text, uploadedUrls, mediaType, isBroadcast, selectedMood, selectedLocation);
        onClose();
    } catch (error) {
        console.error("Upload failed", error);
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="text-gray-500 text-sm font-medium">ยกเลิก</button>
          <h2 className="font-bold text-gray-900">สร้างโพสต์ใหม่</h2>
          <button 
            onClick={handlePost} 
            className="text-blue-600 font-bold text-sm disabled:opacity-50 flex items-center"
            disabled={(!text && selectedFiles.length === 0 && !selectedMood && !selectedLocation) || isUploading}
          >
            {isUploading && <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>}
            โพสต์
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1">
           {/* Chips */}
           {(selectedMood || selectedLocation) && (
              <div className="flex flex-wrap gap-2 mb-3">
                 {selectedMood && (
                   <span className="inline-flex items-center text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                     {selectedMood.split(' ')[1]} กำลังรู้สึก {selectedMood.split(' ')[0]}
                     <button onClick={() => setSelectedMood(undefined)} className="ml-1 text-yellow-600">&times;</button>
                   </span>
                 )}
                 {selectedLocation && (
                   <span className="inline-flex items-center text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">
                     📍 ที่ {selectedLocation}
                     <button onClick={() => setSelectedLocation(undefined)} className="ml-1 text-red-600">&times;</button>
                   </span>
                 )}
              </div>
           )}

          <textarea
            className="w-full h-20 resize-none text-base outline-none placeholder-gray-400"
            placeholder="คุณกำลังคิดอะไรอยู่..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {/* Preview */}
          {mediaPreviews.length > 0 && (
            <div className="mb-4">
              {mediaType === 'image' ? (
                <div className={`grid gap-2 ${
                    mediaPreviews.length === 1 ? 'grid-cols-1' : 
                    mediaPreviews.length === 2 ? 'grid-cols-2' : 
                    'grid-cols-3'
                }`}>
                    {mediaPreviews.map((src, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                             <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                             <button 
                                onClick={() => removeMedia(idx)}
                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                <span className="block w-4 h-4 leading-3 text-center text-xs">&times;</span>
                             </button>
                        </div>
                    ))}
                    {mediaPreviews.length < 50 && (
                        <label className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 aspect-square">
                            <span className="text-gray-400 text-2xl">+</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                        </label>
                    )}
                </div>
              ) : (
                <div className="relative flex justify-center bg-black rounded-lg overflow-hidden">
                    <div className={`relative ${mediaType === 'short_video' ? 'aspect-[9/16] h-64' : 'w-full h-48'}`}>
                        <video 
                            ref={videoRef}
                            src={mediaPreviews[0]} 
                            controls 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                    <button 
                        onClick={() => removeMedia(0)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                        &times;
                    </button>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="mb-3">
             <button 
               onClick={onGoLive}
               className="w-full bg-red-600 text-white py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:bg-red-700 transition"
             >
                {ICONS.Live}
                <span>ถ่ายทอดสด (Live)</span>
             </button>
          </div>

          <div className="flex justify-between items-center mt-2">
             <button
                onClick={handleEnhance}
                disabled={isEnhancing || !text}
                className="flex items-center space-x-1 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 disabled:opacity-50"
             >
                {isEnhancing ? 'กำลังคิด...' : '✨ ให้ AI ช่วยเขียน'}
             </button>

             {isAdmin && (
               <label className="flex items-center space-x-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-100 ring-1 ring-blue-200">
                  <input 
                    type="checkbox" 
                    checked={isBroadcast} 
                    onChange={(e) => setIsBroadcast(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>ประกาศ (Broadcast)</span>
               </label>
             )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3 flex-shrink-0">
           {showMoodSelector && (
             <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 grid grid-cols-4 gap-2 mb-2 animate-fade-in-up">
                {MOODS.map((m) => (
                   <button 
                      key={m.label} 
                      onClick={() => { setSelectedMood(`${m.label} ${m.emoji}`); setShowMoodSelector(false); }}
                      className="flex flex-col items-center justify-center p-2 hover:bg-gray-50 rounded"
                   >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] text-gray-600">{m.label}</span>
                   </button>
                ))}
             </div>
           )}

           {showLocationSelector && (
             <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-2 mb-2 animate-fade-in-up">
                {LOCATIONS.map((loc) => (
                   <button 
                      key={loc} 
                      onClick={() => { setSelectedLocation(loc); setShowLocationSelector(false); }}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                   >
                      📍 {loc}
                   </button>
                ))}
             </div>
           )}

           <div className="flex justify-between items-center">
               <div className="flex space-x-4">
                  <label className="flex items-center space-x-1 text-gray-600 cursor-pointer hover:text-green-600 transition">
                      {ICONS.Image}
                      <span className="text-xs font-medium">รูปภาพ</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                  </label>

                  <label className="flex items-center space-x-1 text-gray-600 cursor-pointer hover:text-green-600 transition">
                      {ICONS.Video}
                      <span className="text-xs font-medium">วิดีโอ</span>
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                  </label>
                  
                  <button 
                    onClick={() => { setShowMoodSelector(!showMoodSelector); setShowLocationSelector(false); }}
                    className={`flex items-center space-x-1 cursor-pointer transition ${showMoodSelector ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'}`}
                  >
                      {ICONS.Smile}
                      <span className="text-xs font-medium">ความรู้สึก</span>
                  </button>

                  <button 
                    onClick={() => { setShowLocationSelector(!showLocationSelector); setShowMoodSelector(false); }}
                    className={`flex items-center space-x-1 cursor-pointer transition ${showLocationSelector ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
                  >
                      {ICONS.Map}
                      <span className="text-xs font-medium">เช็คอิน</span>
                  </button>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};
