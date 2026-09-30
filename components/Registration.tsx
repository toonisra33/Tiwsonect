import React, { useState } from 'react';
import { ICONS } from '../constants';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface RegistrationProps {
  onRegister?: (userData: RegistrationData) => void;
  onContinueAsGuest?: () => void;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  id: string;
}

export const Registration: React.FC<RegistrationProps> = ({ onContinueAsGuest }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
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

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user doc exists in Firestore, if not create it
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUserData = {
          id: user.uid,
          name: user.displayName || 'ผู้ใช้งาน TiWsonect',
          email: user.email || '',
          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`,
          bio: 'สมาชิกใหม่ TiWsonect',
          isOnline: true,
          coverPhoto: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1200&auto=format&fit=crop',
          stats: { posts: 0, followers: 0, following: 0 }
        };

        try {
          await setDoc(userRef, newUserData);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        if (!formData.email || !formData.password) {
           throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
          throw new Error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('รหัสผ่านไม่ตรงกัน');
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random`;
        await updateProfile(user, {
            displayName: formData.fullName,
            photoURL
        });

        try {
          await setDoc(doc(db, "users", user.uid), {
              id: user.uid,
              name: formData.fullName,
              email: formData.email,
              avatar: photoURL,
              bio: 'สมาชิกใหม่ TiWsonect',
              isOnline: true,
              coverPhoto: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1200&auto=format&fit=crop',
              stats: { posts: 0, followers: 0, following: 0 }
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      if (err.code === 'auth/email-already-in-use') msg = "อีเมลนี้ถูกใช้งานแล้ว";
      if (err.code === 'auth/weak-password') msg = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      setError(err.message?.includes('Firestore Error') ? 'เชื่อมต่อฐานข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up relative z-10 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
           <div className="w-14 h-14 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-md shadow-inner">
              <span className="text-3xl font-extrabold">T</span>
           </div>
          <h1 className="text-2xl font-bold mb-1">{isLoginMode ? 'เข้าสู่ระบบ TiWsonect' : 'สร้างบัญชีใหม่'}</h1>
          <p className="text-blue-100 text-xs">เชื่อมต่อกับ Cloud Firestore เรียบร้อยแล้ว</p>
        </div>

        {/* Body */}
        <div className="p-6 pt-5">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-2.5 px-4 mb-4 border border-gray-300 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 transition shadow-sm hover:shadow"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-xs">หรือใช้อีเมล</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">{ICONS.Profile}</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="ชื่อจริง นามสกุล"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">อีเมล</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs text-center bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 rounded-xl font-bold text-white shadow-md transition-all transform hover:scale-[1.01] bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 flex justify-center text-sm"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  isLoginMode ? 'เข้าสู่ระบบด้วยอีเมล' : 'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-4 text-center text-xs">
            <p className="text-gray-600">
              {isLoginMode ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้ว?'}
              <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="text-blue-600 font-bold ml-1 hover:underline"
              >
                {isLoginMode ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </p>
          </div>

          {/* Guest / Demo Option */}
          {onContinueAsGuest && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-gray-500 hover:text-gray-800 transition underline"
              >
                ทดลองใช้งานในโหมด Guest (Demo User)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
