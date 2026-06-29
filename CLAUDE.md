# CLAUDE.md — Chow-app

คู่มือสำหรับ Claude Code. อ่านไฟล์นี้ก่อนเริ่มทุกครั้ง. ภาพรวมโปรเจกต์ดูที่ `PLAN.md`.

## Project
แอปครอบครัวเชาว์ (หม่าม๊า / เฟิสท์ / มิ้นท์ / บอส / วิน). UI ภาษาไทยทั้งหมด,
identifier ในโค้ดเป็นอังกฤษ. Mobile-first (คนในบ้านเปิดบนมือถือเป็นหลัก).

## Stack & commands
- React + **Vite** (ไม่ใช่ Next.js), `react-router-dom`
- Supabase (DB + Storage + Realtime), Vercel, GitHub
- `vite-plugin-pwa` สำหรับ PWA installable
- dev: `npm run dev` · build: `npm run build` · preview: `npm run preview`

## ENV (`.env.local` — อย่า commit)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## โครงโฟลเดอร์
```
src/
  lib/        supabase.js · date.js · reminders.js
  hooks/      useAuth · useMembers · useGallery · useNotes · useRestaurants ·
              useMenuItems · useOrders · useEvents · useReminders ·
              useInsurance · useVehicles
  components/ PinGate · Layout · NavBar · MemberPicker · MemberTag ·
              MemberAvatar · CountdownCard · StatusPill · EmptyState
  pages/      Home · Notes · Restaurants · RestaurantDetail · Calendar ·
              Insurance · Vehicles
sql/          schema.sql · policies.sql · seed.sql   (เฟิสท์รันเองใน Supabase)
```

## กติกาเหล็ก (ทำตามทุกข้อ)

1. **ทุกการเข้าถึง Supabase ผ่าน custom hook ใน `src/hooks/` เท่านั้น**
   component/page ห้าม import `supabase` ตรง ๆ. Logic CRUD + Realtime อยู่ใน hook.

2. **วันที่ใช้ `lib/date.js` — ห้ามใช้ `new Date().toISOString()` กับ field แบบ date**
   `toISOString()` เป็น UTC จะเพี้ยน timezone (เราอยู่ Asia/Bangkok). ใช้ `todayISO()` เสมอ.
   ```js
   // lib/date.js — ใช้ implementation นี้
   export function todayISO() {
     const d = new Date();
     return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
   }
   export function toISODate(date) {
     const d = new Date(date);
     return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
   }
   export function daysUntil(iso) {
     const a = new Date(todayISO()+'T00:00:00');
     const b = new Date(iso+'T00:00:00');
     return Math.round((b - a) / 86400000);
   }
   export function addDays(iso, n) {
     const d = new Date(iso+'T00:00:00'); d.setDate(d.getDate()+n); return toISODate(d);
   }
   export function formatThaiDate(iso) {
     const m = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
     const d = new Date(iso+'T00:00:00');
     return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`; // ปี ค.ศ.; เปลี่ยน +543 ถ้าต้องการ พ.ศ.
   }
   ```

3. **Realtime สำหรับตารางที่แชร์กัน** (notes, orders, order_items, events, members)
   ใช้ Supabase Realtime subscription ใน hook (อย่า polling). อย่าลืม cleanup ตอน unmount.

4. **`<MemberPicker>` คือ component ฐาน** — multi-select toggle แบบหน้าสิทธิ Nira-app
   (กดชื่อเพื่อ select/deselect, แก้ภายหลังได้). ใช้ซ้ำใน: notes, order item, event,
   insurance owner (อันนี้ single-select). อย่าเขียน picker ซ้ำในแต่ละหน้า.

5. **Reminder engine กลาง** — `useReminders()` union แหล่งต่อไปนี้เป็น list เดียว
   (เรียงตามวัน, แต่ละรายการมี `{ title, date, daysUntil, status, type }`):
   - events (`event_date >= today`)
   - insurance: `next_due_date`, `coverage_end_date`
   - vehicles: `tax_due_date`, `cmi_due_date`, `insurance_due_date`, `next_service_date`
   **ไม่ duplicate ลง events table** — คำนวณรวมฝั่ง client.
   สถานะสีจาก `lib/reminders.js`: overdue (<0), red (<7), yellow (<30), green (อื่น ๆ).
   เกณฑ์วันเก็บเป็น const ปรับได้.

6. **Money / premium ต่อปี** — เก็บ `numeric`. แปลงเบี้ยต่อปี:
   `premium × {year:1, semi:2, quarter:4, month:12}[premium_frequency]`.
   หน้าประกัน: การ์ดสรุปเบี้ย/ปีต่อคน + ยอดลดหย่อน/คน. ฟิลเตอร์: นายหน้า/เจ้าของ/ลดหย่อนได้.
   ⚠️ ลดหย่อน = บวกยอดที่ผู้ใช้กรอกเองเท่านั้น ห้ามคำนวณเพดานสรรพากรหรือให้คำแนะนำภาษี.

7. **ข้อมูลอ่อนไหว** (เลขกรมธรรม์, เลขทะเบียน, รูปเล่มทะเบียน/ประกัน):
   - รูป → bucket `documents` **private** + `createSignedUrl()` เท่านั้น. ห้าม public, ห้ามใส่ใน URL.
   - แกลเลอรีครอบครัว → bucket `gallery` (public-read).
   - ห้าม log ค่าเหล่านี้ออก console.

8. **PIN gate** — `<PinGate>` 4 ช่อง, อ่าน pin จาก `app_settings` (ค่าเริ่ม `1234`).
   เป็นประตูฝั่ง client เท่านั้น (รับรู้ว่าไม่ใช่ security จริง — ดู PLAN ข้อ 8).
   เก็บสถานะผ่าน PIN ใน React state/sessionStorage (อย่าใช้ localStorage ถาวรแบบไม่หมดอายุ).

## PWA
- เปิด `vite-plugin-pwa` (registerType autoUpdate) + manifest (ชื่อ "CHOW Family", ไอคอน, theme สี).
- **Push notification ยังไม่ทำ** — แค่ทำให้ติดตั้งลงจอโฮมได้.
  เผื่ออนาคต: เตรียม `push_subscriptions(member_id, endpoint, keys jsonb)` + service worker push handler
  ได้ แต่ **อย่าเพิ่ง implement การส่งจริง** จนกว่าจะได้รับมอบหมาย (ต้องมี VAPID + cron).

## Git / workflow
- ทำงานบน feature branch, **ห้าม push ตรงเข้า `main`** โดยไม่ให้เฟิสท์ review ก่อน
- commit เป็นก้อนเล็ก สื่อความหมาย
- **เปลี่ยน schema = แก้/เพิ่มไฟล์ใน `sql/` แล้วบอกเฟิสท์ให้รันเอง** (Claude Code เข้า Supabase ไม่ได้)
- ห้ามรัน destructive SQL (drop/truncate) เอง — เขียนเป็นไฟล์ + เตือนก่อน
- ไม่ commit `.env*` หรือ key ใด ๆ

## เป้าหมาย MVP (ตามลำดับใน PLAN ข้อ 10)
Home+Gallery → Notes → Restaurants → Calendar(นัด+สิทธิประโยชน์) → Insurance → Vehicles
เฟส 2: บิลบ้าน / ฉุกเฉิน / shopping list / โหวต (ยังไม่ทำ)
