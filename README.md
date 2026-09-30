# TiWsonect 🌐

โซเชียลมีเดียแพลตฟอร์มแบบครบวงจร พัฒนาด้วย React 19, TypeScript, Tailwind CSS, Google Gemini 2.5 และ Cloud Firestore

## 🚀 ฟีเจอร์หลัก (Key Features)
* **หน้าฟีด & สตอรี่ (News Feed & Stories):** โพสต์ข้อความ, รูปภาพหลายรูป, วิดีโอ, เช็คอินสถานที่, แท็กอารมณ์ความรู้สึก (Mood Tagging), และการประกาศข่าวสารด่วน (Broadcast)
* **วิดีโอสั้น (Short Clips):** เครื่องเล่นคลิปวิดีโอแนวตั้งแบบเต็มจอพร้อมการโต้ตอบ
* **ถ่ายทอดสด (Live Streaming):** รองรับทั้งโหมดผู้จัดไลฟ์ (Live Broadcaster) และโหมดผู้ชม (Live Viewer) พร้อมกล่องแชทสดและเอฟเฟกต์หัวใจ
* **ค้นหาเพื่อนใกล้เคียง (Explore Nearby):** คำนวณระยะทางแบบ Real-time ด้วย Geolocation API
* **แชทส่วนตัว (Real-time Chat):** ส่งข้อความ 1:1 พร้อมระบบตอบกลับอัจฉริยะจาก AI (Smart AI Reply)
* **AI Enhancer & Insights:** ใช้ Gemini 2.5 Flash ช่วยเกลาแคปชั่นให้โดนใจ และวิเคราะห์พฤติกรรมผู้ใช้ (Mood & Location Insights)
* **ฐานข้อมูล Cloud Firestore:** จัดเก็บและซิงค์ข้อมูลแบบ Real-time พร้อมโหมด Offline Fallback

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **AI / LLM:** `@google/genai` (Gemini 2.5 Flash)
* **Database & Auth:** Firebase v12 (Cloud Firestore, Firebase Authentication, Firebase Storage)
* **PWA:** Web App Manifest

## 📦 การติดตั้งและการรันโปรเจกต์ (Getting Started)

1. **Clone repository:**
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd tiwsonect
```

2. **ติดตั้ง Dependencies:**
```bash
npm install
```

3. **รัน Dev Server:**
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

4. **การ Build สำหรับ Production:**
```bash
npm run build
```

## 🔒 การกำหนดค่า Firebase
ไฟล์การตั้งค่า Firestore จัดเก็บอยู่ที่ `firebase-applet-config.json` และกฎความปลอดภัยอยู่ใน `firestore.rules`
