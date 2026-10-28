# TEST SYSTEM JPS — UX/UI Hotfix Blue & White

วันที่: 28 ตุลาคม 2026

## เป้าหมาย
- แก้สีตัวหนังสือและพื้นหลังที่ทับกัน/อ่านยาก
- กำหนด final CSS layer ให้เป็นธีมฟ้า–ขาวทั้งระบบ
- ปรับเมนู Sidebar, Topbar, ปุ่ม, ฟอร์ม, ตาราง, Dashboard cards, popup และหน้า Home บนมือถือ
- ลดสีแดง/ชมพูที่มาจาก style เก่าในส่วน UI หลัก โดยไม่เปลี่ยนข้อมูลธุรกิจหรือ logic ของ backend
- ใช้ React lazy loading แยกหน้าหลักเพื่อให้หน้าเริ่มต้นโหลด component น้อยลง

## ไฟล์ที่เปลี่ยน
- `frontend/src/jps-ux-hotfix-2026.css` — CSS ชั้นสุดท้ายสำหรับ theme, contrast, responsive และ popup
- `frontend/src/main.jsx` — import CSS hotfix หลัง style layer เดิมทั้งหมด
- `frontend/src/App.jsx` — ใช้ `React.lazy` + `Suspense` สำหรับหน้าระบบหลัก

## วิธีติดตั้ง / Deploy บน Render
1. แตก ZIP และอัปโหลด/commit source ทั้งชุดไปยัง repository ที่ใช้กับ Render
2. ตรวจว่า Build Command ของ frontend ใช้ `npm ci --include=dev --no-audit --no-fund && npm run build` หรือคำสั่ง build เดิมของโปรเจกต์
3. Deploy ใหม่ แล้วเปิดเว็บด้วย hard refresh (Ctrl+F5) หรือ clear cache
4. ทดสอบ Desktop และมือถืออย่างน้อย: login, dashboard, บันทึกงาน, ประวัติ, บัญชีคนขับ, ใบวางบิล, popup และ upload รูป

## หมายเหตุการตรวจสอบ
- `node scripts/verify-project.js` ผ่าน: package JSON ถูกต้องและไม่พบ merge markers
- ยังยืนยันผล production build ไม่ได้ในสภาพแวดล้อมนี้ เพราะ `npm ci` หมดเวลาและไม่ได้ติดตั้ง Vite ครบ
- การเปลี่ยนครั้งนี้เป็น UI/frontend hotfix ไม่ได้เปลี่ยน schema MongoDB หรือ API backend
