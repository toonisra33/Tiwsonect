
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegistrationProps {
  onRegister: (userData: RegistrationData) => void;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  id: string;
}

export const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between Login and Register
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // --- LOGIN LOGIC ---
        if (!formData.email || !formData.password) {
           throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // App.tsx auth listener will handle the rest
      } else {
        // --- REGISTER LOGIC ---
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
          throw new Error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('รหัสผ่านไม่ตรงกัน');
        }
        
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // 2. Update Display Name
        await updateProfile(user, {
            displayName: formData.fullName,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`
        });

        // 3. Create User Document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            name: formData.fullName,
            email: formData.email,
            avatar: user.photoURL,
            bio: 'สมาชิกใหม่ TiWsonect',
            isOnline: true,
            coverPhoto: 'https://picsum.photos/seed/cover/800/300',
            stats: { posts: 0, followers: 0, following: 0 }
        });

        // App.tsx auth listener will handle the rest
      }
    } catch (err: any) {
      console.error(err);
      let msg = "เกิดข้อผิดพลาด กรุณาลองใหม่";
      if (err.code === 'auth/email-already-in-use') msg = "อีเมลนี้ถูกใช้งานแล้ว";
      if (err.code === 'auth/weak-password') msg = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      if (err.code === 'auth/invalid-credential') msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      setError(msg);
      setIsLoading(false); // Stop loading only on error
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
           <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-md">
              <span className="text-3xl font-bold">T</span>
           </div>
          <h1 className="text-2xl font-bold mb-1">{isLoginMode ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}</h1>
          <p className="text-blue-100 text-sm">TiWsonect Social Platform</p>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Register Only) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">{ICONS.Profile}</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="ชื่อจริง นามสกุล"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Confirm Password (Register Only) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded border border-red-100">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 flex justify-center"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {isLoginMode ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้ว?'}
              <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="text-blue-600 font-bold ml-1 hover:underline"
              >
                {isLoginMode ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
