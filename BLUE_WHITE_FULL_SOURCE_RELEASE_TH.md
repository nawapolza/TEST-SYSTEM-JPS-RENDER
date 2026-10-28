# TEST SYSTEM — JPS | Blue/White Full Source Release

วันที่ปรับปรุง: 28 ตุลาคม 2569

## สิ่งที่ปรับ
- เพิ่ม `frontend/src/jps-blue-white-complete.css` เป็นชั้นธีมสุดท้ายสำหรับรวมสีฟ้า/ขาวและลดผลกระทบจาก CSS เก่า
- ปรับสีแดง/ชมพูที่เป็นค่าสีตรงในไฟล์ CSS/JS ฝั่ง frontend ที่พบ ให้เป็นโทนฟ้า/ขาว
- ปรับ shell/navigation, ปุ่ม, ฟอร์ม, card, billing/finance, loading, chart และ receipt summary ให้ใช้โทนเดียวกัน
- เพิ่ม responsive rules สำหรับ mobile/desktop, ปุ่มสัมผัส, dashboard metrics, billing layout และ safe-area ของ mobile dock
- ไม่เปลี่ยนโครงสร้าง API, MongoDB schema, login credentials หรือข้อมูลธุรกิจเดิมโดยเจตนา

## Deploy บน Render
1. สำรอง ZIP/source และฐานข้อมูลก่อนทับระบบจริง
2. แตก ZIP แล้วนำ source ทั้งโปรเจกต์เข้า repository ที่ Render ใช้ deploy
3. ตรวจ Root Directory / Build Command / Start Command ให้ตรงกับค่าเดิมของบริการ
4. Build frontend ด้วย `cd frontend && npm ci --include=dev && npm run build` (หรือใช้คำสั่ง build ที่ตั้งไว้ใน Render)
5. Deploy แล้ว hard refresh บนมือถือและคอมพิวเตอร์

## หมายเหตุการตรวจสอบ
- การปรับนี้เป็น frontend/theme-focused; backend และ MongoDB ไม่ได้เปลี่ยน schema
- การติดตั้ง dependency ในสภาพแวดล้อมจัดทำ ZIP ครั้งนี้หมดเวลารอ จึงไม่สามารถยืนยันผล `vite build` จากสภาพแวดล้อมนี้ได้ ควรให้ Render build ตรวจอีกครั้งก่อนใช้งานจริง
- อย่าใส่ MongoDB URI/JWT secret จริงลงในไฟล์ ZIP หรือ repository สาธารณะ ให้เก็บใน Render Environment Variables
