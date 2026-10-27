# TEST SYSTEM — JPS | คู่มือติดตั้งบน Render

## โครงสร้างบริการ
- Backend: Web Service, Root Directory `backend`, Build `npm ci --no-audit --no-fund`, Start `npm start`
- Frontend: Static Site, Root Directory `frontend`, Build `npm ci --include=dev --no-audit --no-fund && npm run build`, Publish Directory `dist`

## Backend Environment Variables
- `NODE_VERSION` = `20.19.0`
- `MONGODB_DB` = `test`
- `MONGODB_URI` = MongoDB Atlas connection string (ใส่ใน Render เท่านั้น)
- `JWT_SECRET` = สุ่ม secret ใหม่ที่ยาวและไม่ซ้ำ
- `JWT_EXPIRE_SECONDS` = `604800`
- `UPLOAD_MAX_MB` = `5`
- `CORS_ALLOW_ALL` = `false`
- `CORS_ALLOWED_ORIGINS` = URL จริงของ Static Site เช่น `https://test-system-jps.onrender.com`
- `APP_TIMEZONE` = `Asia/Bangkok`

## Frontend Environment Variables
- `VITE_API_URL` = URL จริงของ Backend เช่น `https://test-system-jps-backend.onrender.com`

ห้ามใส่ `MONGODB_URI` หรือ `JWT_SECRET` ใน Frontend เพราะค่าที่ขึ้นต้นด้วย `VITE_` อาจถูกเปิดเผยในไฟล์เว็บที่ส่งให้ผู้ใช้

## ขั้นตอน
1. Push ไฟล์ทั้งหมดใน repository ไป GitHub
2. สร้าง Backend Web Service ตามค่าข้างต้น
3. เพิ่ม Environment Variables ของ Backend และ Deploy ให้สำเร็จ
4. สร้าง Frontend Static Site จาก repository เดิม
5. ตั้ง Root Directory เป็น `frontend`, Build Command ตามข้างต้น และ Publish Directory `dist`
6. ตั้ง `VITE_API_URL` ให้ตรงกับ Backend แล้ว Deploy
7. ตรวจสอบ `https://<backend-url>/health-ready`

## สำคัญด้านความปลอดภัย
รหัสผ่าน MongoDB และ JWT secret ที่เคยส่งผ่านแชตควรถือว่าเปิดเผยแล้ว ให้เปลี่ยนรหัสผ่าน Database User ใน MongoDB Atlas และสร้าง JWT secret ใหม่ก่อนใช้งานจริง ห้าม commit `.env` หรือ credentials ลง GitHub

## ข้อควรทราบ
การ Deploy สำเร็จขึ้นกับไฟล์ใน repository และ Environment Variables จริง คู่มือนี้ไม่ได้ยืนยันว่าบริการบน Render ได้ Deploy สำเร็จแล้ว ควรตรวจสอบ Build Logs และ Runtime Logs หลัง Deploy ทุกครั้ง
