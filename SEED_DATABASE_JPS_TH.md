# เติมข้อมูลเริ่มต้น TEST SYSTEM JPS ลง MongoDB Atlas

สคริปต์ `backend/seed_demo_data.js` สร้างข้อมูลตัวอย่างสำหรับทดสอบใน Collection ที่ระบบปัจจุบันใช้ โดยไม่ลบข้อมูลเดิม และรันซ้ำได้โดยไม่เพิ่มรายการตัวอย่างซ้ำ

## Collection ที่สคริปต์เติม/ตรวจสอบ

- `branches` — สาขาหลัก (ใช้สาขาที่มีอยู่แล้ว ถ้ามี)
- `users` — บัญชี `admin` (Admin) และ `test` (User) เฉพาะกรณียังไม่มีบัญชี
- `vehicles` — รถตัวอย่าง 2 คัน
- `stocks` — รายการ ดีเซล / น้ำมันเครื่อง / แอดบลู (ยอดคงเหลือเดิมจะไม่ถูกเขียนทับ)
- `transport_materials` — หิน ทราย ทรายหยาบ ทรายถม
- `deliveries` — เที่ยวตัวอย่าง 4 เที่ยวและบิลเติมน้ำมัน
- `driver_trips`, `driver_advances` — รายได้คนขับและเงินเบิกตัวอย่าง
- `trip_finance`, `transport_ledger` — รายรับรายจ่ายตัวอย่าง
- `stock_movements`, `stock_transactions`, `stock_audits` — ประวัติคลังตัวอย่าง
- `notifications`, `system_settings` — แจ้งเตือน/เวอร์ชัน seed
- `uploaded_files` — ไฟล์ SVG ตัวอย่างเก็บเป็นข้อมูลใน MongoDB เพื่อทดสอบ route `/uploads/db/:id`

**คำเตือน:** ข้อมูลมีไว้ทดสอบเท่านั้น ไม่ใช่ยอดบัญชีจริง รายการตัวอย่างมี `demo_key` และบางรายการมี `is_demo: true` โปรดตรวจสอบ/ลบรายการตัวอย่างก่อนนำไปใช้ทำบัญชีจริง

## วิธีรันบน Windows (PowerShell)

1. แตก ZIP แล้วเปิด PowerShell ในโฟลเดอร์ `TEST-SYSTEM-JPS-RENDER`.
2. เข้าโฟลเดอร์ Backend:

```powershell
cd backend
npm install
```

3. ตั้งค่า URI ของ MongoDB ใน PowerShell โดยใช้ URI ของ Cluster0 ของคุณเอง อย่าโพสต์ URI ที่มีรหัสผ่านลงแชตหรือ GitHub:

```powershell
$env:MONGODB_URI = 'mongodb+srv://<DB_USER>:<DB_PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority'
$env:MONGODB_DB = 'test_system_jps'
npm run seed:demo
```

แทนที่ `<DB_USER>`, `<DB_PASSWORD>` และชื่อ Cluster ด้วยค่าจริงจาก MongoDB Atlas. ถ้ารหัสผ่านมีอักขระพิเศษ เช่น `@`, `:`, `/`, `?`, `#`, ต้อง URL-encode ก่อนใส่ใน URI.

4. เมื่อเสร็จ จะเห็นรายงานจำนวนเอกสารของแต่ละ Collection ในหน้าต่าง PowerShell. เปิด Atlas → Cluster0 → Browse Collections → Refresh.

## บัญชีตัวอย่าง

- Admin: `admin` / `admim.admim`
- User: `test` / `test`

บัญชีจะถูกสร้างเฉพาะเมื่อ username ยังไม่มีอยู่ หากมีอยู่แล้ว สคริปต์จะไม่เปลี่ยนรหัสผ่านเดิมโดยอัตโนมัติ หากต้องการรีเซ็ตบัญชีตัวอย่างทั้งสองอย่างชัดเจน ให้ตั้งค่าต่อไปนี้ก่อนรันสคริปต์:

```powershell
$env:SEED_RESET_DEMO_PASSWORDS = 'true'
npm run seed:demo
Remove-Item Env:SEED_RESET_DEMO_PASSWORDS
```

หากตั้ง `SEED_RESET_DEMO_PASSWORDS=true` สคริปต์จะเปลี่ยนรหัสผ่านของ `admin` และ `test` เป็นค่าตัวอย่างข้างต้น และเพิ่ม `auth_version` เพื่อให้ token เก่าหมดอายุ ใช้เฉพาะฐานข้อมูลทดสอบและเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบ

## การอัปโหลดรูป/ไฟล์

Backend ปัจจุบันมีระบบรับไฟล์ผ่าน endpoint ที่รองรับการอัปโหลดในหน้าบันทึกงาน และเก็บไฟล์ขนาดเหมาะสมลง `uploaded_files` ใน MongoDB พร้อม URL `/uploads/db/<id>`. สคริปต์นี้เพิ่ม SVG ตัวอย่างหนึ่งไฟล์เพื่อทดสอบการอ่านไฟล์จากฐานข้อมูล ไม่ได้แทนการอัปโหลดรูปบิลจริงจากหน้าเว็บ

## หมายเหตุเรื่อง Render

Render Web Service บางแผนอาจไม่มี Shell ให้สั่งคำสั่งโดยตรง. วิธีที่ง่ายที่สุดคือรันสคริปต์จากเครื่อง Windows โดยใช้ URI ของ Atlas ตามขั้นตอนข้างต้น. ห้ามเพิ่ม URI ที่มีรหัสผ่านลงในไฟล์โค้ดหรือ commit ขึ้น GitHub.
