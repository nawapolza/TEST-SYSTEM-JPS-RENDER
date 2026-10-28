# TEST SYSTEM JPS — Blue & White Source-Level Theme Update

- เปลี่ยนคลาส Tailwind เฉดสีเดิมในไฟล์ JSX/JS/CSS ที่เกี่ยวข้องเป็นสีน้ำเงิน/ฟ้าโดยตรง ไม่ใช่ CSS ทับอย่างเดียว
- ปรับค่าสีแบรนด์และเงาที่ฝังอยู่ในไฟล์ CSS ให้ใช้โทนสี JPS
- เพิ่ม `frontend/src/jps-unified-2026.css` สำหรับการเข้าถึง, Popup, mobile safe-area และป้องกันล้นขอบ
- คงสีแดงสำหรับข้อผิดพลาด/การลบ และอาจมีสีสถานะอื่นในบางส่วนเพื่อสื่อความหมาย
- ไม่แก้ฐานข้อมูล, ผู้ใช้, ระบบ Login, Backend API และข้อมูลที่บันทึกแล้ว
- ต้องตรวจสอบ Build และทดสอบหน้าจอ/Workflow บน Render ก่อนใช้งานจริง

## Render
Frontend Static Site: Root Directory `frontend`; Build `npm ci && npm run build`; Publish `dist`
Backend Web Service: ไม่จำเป็นต้อง Deploy ใหม่หากไม่มีการเปลี่ยนไฟล์ backend

## Git
คัดลอกไฟล์ทั้งหมดทับ Repository เดิม (เก็บ `.git` ของตนไว้) แล้วรัน `git add -A`, `git commit -m "JPS blue white theme rebuild"`, `git push origin main`.
