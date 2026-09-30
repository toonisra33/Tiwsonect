# TiWsonect 🌐

โซเชียลมีเดียแพลตฟอร์มแบบครบวงจร พัฒนาด้วย React 19, TypeScript, Tailwind CSS, Google Gemini 2.5 และ Cloud Firestore

## 🚀 ฟีเจอร์หลัก (Key Features)
* **หน้าฟีด & สตอรี่ (News Feed & Stories):** โพสต์ข้อความ, รูปภาพหลายรูป, วิดีโอ, เช็คอินสถานที่, แท็กอารมณ์ความรู้สึก (Mood Tagging), และการประกาศข่าวสารด่วน (Broadcast)
* **ซิงค์ข้อมูลจาก GitHub ขึ้น Cloud Firestore (GitHub ➔ Firestore Sync):** รองรับทั้งเครื่องมือหน้าเว็บ (Web UI), คำสั่ง CLI, และ GitHub Actions CI/CD อัตโนมัติ
* **วิดีโอสั้น (Short Clips):** เครื่องเล่นคลิปวิดีโอแนวตั้งแบบเต็มจอพร้อมการโต้ตอบ
* **ถ่ายทอดสด (Live Streaming):** รองรับทั้งโหมดผู้จัดไลฟ์ (Live Broadcaster) และโหมดผู้ชม (Live Viewer) พร้อมกล่องแชทสดและเอฟเฟกต์หัวใจ
* **ค้นหาเพื่อนใกล้เคียง (Explore Nearby):** คำนวณระยะทางแบบ Real-time ด้วย Geolocation API
* **แชทส่วนตัว (Real-time Chat):** ส่งข้อความ 1:1 พร้อมระบบตอบกลับอัจฉริยะจาก AI (Smart AI Reply)
* **AI Enhancer & Insights:** ใช้ Gemini 2.5 Flash ช่วยเกลาแคปชั่นให้โดนใจ และวิเคราะห์พฤติกรรมผู้ใช้ (Mood & Location Insights)
* **ฐานข้อมูล Cloud Firestore:** จัดเก็บและซิงค์ข้อมูลแบบ Real-time พร้อมโหมด Offline Fallback

## 🔄 วิธีการส่งข้อมูลจาก GitHub ขึ้น Cloud Firestore

มี 3 วิธีที่สามารถใช้งานได้ตามความสะดวก:

### วิธีที่ 1: ผ่านหน้าต่าง Web UI ในแอปพลิเคชัน (แนะนำ)
1. เปิดแอปพลิเคชัน TiWsonect
2. กดปุ่มสีดำ **`GitHub ➔ Firestore`** ที่แถบเมนูด้านบน (ข้างโลโก้และป้ายสถานะ Firestore)
3. เลือกแหล่งข้อมูล:
   * **ชุดข้อมูลใน Repo**: ใช้ข้อมูลสำเร็จรูปจาก `data/github_posts.json`
   * **ดึงจาก GitHub URL**: ใส่ Raw URL ของไฟล์ JSON จาก Repository บน GitHub
   * **ใส่ JSON โดยตรง**: วาง JSON ปรับแต่งเอง
4. กดปุ่ม **`ส่ง X รายการขึ้น Firestore 🚀`** ข้อมูลจะถูกเขียนลงฐานข้อมูลและปรากฏบนหน้าฟีดแบบเรียลไทม์ทันที

---

### วิธีที่ 2: รันผ่านคำสั่ง CLI Terminal
รันคำสั่งซิงค์ข้อมูลจากชุดข้อมูลใน GitHub เข้าสู่ Cloud Firestore โดยตรง:
```bash
npm run sync:github
```
สคริปต์จะอ่านไฟล์ `data/github_posts.json` และ `data/github_users.json` แล้วอัปโหลดเข้าสู่คอลเลกชัน `posts` และ `users` ใน Cloud Firestore ให้โดยอัตโนมัติ

---

### วิธีที่ 3: อัตโนมัติผ่าน GitHub Actions (CI/CD)
โปรเจกต์มาพร้อมกับ Workflow `.github/workflows/sync-firestore.yml`
เมื่อคุณ Push โค้ดหรืออัปเดตไฟล์ในโฟลเดอร์ `data/` ขึ้นสู่ GitHub:
```bash
git add data/
git commit -m "feat: add new community posts"
git push origin main
```
GitHub Actions จะรันและซิงค์ข้อมูลขึ้น Cloud Firestore ให้อัตโนมัติ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **AI / LLM:** `@google/genai` (Gemini 2.5 Flash)
* **Database & Auth:** Firebase v12 (Cloud Firestore, Firebase Authentication, Firebase Storage)
* **DevOps / CI/CD:** GitHub Actions, Node.js Data Syncer

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

## 🔒 การกำหนดค่าความปลอดภัย
* ไฟล์การตั้งค่า Firestore: `firebase-applet-config.json`
* กฎความปลอดภัย Zero-Trust ABAC: `firestore.rules`
* เอกสารข้อกำหนดความปลอดภัย: `security_spec.md`
