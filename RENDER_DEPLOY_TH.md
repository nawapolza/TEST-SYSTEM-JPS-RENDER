# คู่มือติดตั้ง TEST SYSTEM — JPS บน Render (ภาษาไทย)

## สำคัญเรื่องความปลอดภัย
ค่ารหัสผ่าน MongoDB และ JWT secret ที่ส่งมาในแชตควรถือว่าเปิดเผยแล้ว ให้เปลี่ยนรหัสผ่าน Database User ใน MongoDB Atlas และสร้าง JWT secret ใหม่ก่อนนำระบบขึ้นใช้งานจริง ห้ามนำ secret ใส่ในซอร์สโค้ดหรือ commit เข้า GitHub

## โครงสร้างบริการ
- **Backend Web Service:** `oil-management-system-fixed-1-backend`
- **Frontend Static Site:** `oil-management-system-fixed`
- **ฐานข้อมูล:** MongoDB Atlas (`MONGODB_DB=test`)

## วิธีทำบน Render
1. แตกไฟล์ ZIP แล้วอัปโหลดโปรเจกต์ทั้งหมดเข้า GitHub repository ใหม่ หรือ push ไป repository ที่จะใช้ deploy
2. เข้า Render Dashboard → **New +** → **Blueprint** แล้วเชื่อม GitHub repository นี้ Render จะอ่าน `render.yaml` และสร้าง Web Service กับ Static Site
3. หากคุณสร้างบริการสองตัวนี้ไว้แล้ว ให้เปิดบริการเดิมและตั้งค่าตามหัวข้อ Environment ด้านล่างแทนการสร้างบริการชื่อซ้ำ
4. เปิด Backend Web Service → **Environment** แล้วกรอก secret ใหม่ใน `MONGODB_URI` และ `JWT_SECRET`
5. ตรวจว่า MongoDB Atlas → Network Access อนุญาตการเชื่อมต่อจาก Render และ Database User มีสิทธิ์กับฐานข้อมูล `test`
6. Deploy Backend ให้เสร็จก่อน จากนั้นตรวจ URL `https://oil-management-system-fixed-1-backend.onrender.com/health-ready`
7. เปิด Frontend Static Site → Environment ตรวจ `VITE_API_URL` ว่าเป็น URL ของ Backend (ไม่ใช่ URL หน้าเว็บ) แล้วสั่ง **Manual Deploy → Clear build cache & deploy** หากมีการแก้ Environment

## Environment ของ Backend Web Service
ตั้งค่าทีละตัวใน Render → Backend → Environment:

- `NODE_VERSION` = `20.19.0`
- `MONGODB_DB` = `test`
- `MONGODB_URI` = URI จาก MongoDB Atlas ที่ใช้รหัสผ่านใหม่ (ห้ามใส่ backslash หนีเครื่องหมาย `:` หรือ `//`)
- `JWT_SECRET` = ค่าสุ่มใหม่ที่ยาวและคาดเดายาก
- `JWT_EXPIRE_SECONDS` = `604800`
- `UPLOAD_MAX_MB` = `5`
- `CORS_ALLOW_ALL` = `false` (แนะนำให้ใช้ false ไม่เปิด CORS ทุกเว็บไซต์)
- `CORS_ALLOWED_ORIGINS` = `https://oil-management-system-fixed.onrender.com`
- `APP_TIMEZONE` = `Asia/Bangkok`

## Environment ของ Frontend Static Site
- `NODE_VERSION` = `20.19.0`
- `VITE_API_URL` = `https://oil-management-system-fixed-1-backend.onrender.com`

หลังแก้ `VITE_API_URL` ต้อง build/deploy Frontend ใหม่ เพราะตัวแปร `VITE_` ถูกฝังในไฟล์ตอน build

## การตรวจสอบเบื้องต้น
- Backend: เปิด `/health-ready` ต้องตอบสถานะพร้อมใช้งานและเชื่อมต่อฐานข้อมูลได้
- Frontend: เปิดหน้าเว็บและเข้าสู่ระบบ ทดสอบบันทึกข้อมูลด้วยข้อมูลทดลองก่อน
- ถ้าพบ CORS ให้ตรวจว่า URL Frontend ใน `CORS_ALLOWED_ORIGINS` ตรงทุกตัวอักษรกับโดเมนจริง และไม่มี slash ต่อท้าย
- ถ้า Render สร้าง URL ที่ต่างจากตัวอย่าง ให้ปรับทั้ง `CORS_ALLOWED_ORIGINS` และ `VITE_API_URL` ให้ตรงกับ URL จริง แล้ว redeploy ทั้งสองบริการตามลำดับ

## ข้อควรทราบ
- ไม่ต้องใส่ `CORS_ALLOW_ALL=true` เมื่อใช้โดเมนที่ระบุชัดเจน; ให้ใช้ `false` และ allowlist เฉพาะ Frontend
- ไม่ต้องใส่ backslash เช่น `https\://...` ในช่อง Environment ของ Render ให้ใส่ URL ปกติ `https://...`
- อย่าใช้รหัสผ่านที่ปรากฏในแชตนี้ต่อไป
