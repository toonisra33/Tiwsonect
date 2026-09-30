
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// =================================================================
// ⚠️ ขั้นตอนการตั้งค่า FIREBASE (สำคัญมาก) ⚠️
// 1. ไปที่ https://console.firebase.google.com/
// 2. สร้าง Project ใหม่ และกดเมนู "Project Settings" (รูปเฟือง)
// 3. เลื่อนลงมาล่างสุด เลือกไอคอน </> (Web) เพื่อสร้างแอป
// 4. คัดลอกค่า config ที่ได้ มาแทนที่ค่าด้านล่างนี้ทั้งหมด
// =================================================================

const firebaseConfig = {
  // นำค่า apiKey จาก Firebase Console มาใส่แทนที่ข้อความในเครื่องหมายคำพูด
  apiKey: "YOUR_API_KEY_HERE", 
  
  // นำค่า authDomain มาใส่
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", 
  
  // นำค่า projectId มาใส่
  projectId: "YOUR_PROJECT_ID", 
  
  // นำค่า storageBucket มาใส่
  storageBucket: "YOUR_PROJECT_ID.appspot.com", 
  
  // นำค่า messagingSenderId มาใส่
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", 
  
  // นำค่า appId มาใส่
  appId: "YOUR_APP_ID" 
};

// ตรวจสอบว่าใส่ค่าหรือยัง เพื่อป้องกันหน้าขาว
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

if (!isConfigured) {
  console.warn(
    "%c⚠️ ยังไม่ได้เชื่อมต่อ Firebase ⚠️", 
    "color: red; font-size: 16px; font-weight: bold;"
  );
  console.log("กรุณาเปิดไฟล์ firebaseConfig.ts แล้วนำค่า API Key จาก Firebase Console มาใส่");
}

// Initialize Firebase only if configured (or with dummy so it doesn't immediately crash if possible)
// But wait, getAuth requires an initialized app.
// To avoid breaking imports, we can initialize with dummy values if we want, but it's better to just use dummy format
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.error("Firebase init failed:", e);
}

// Export services safely
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;
export const storage = app ? getStorage(app) : null as any;
