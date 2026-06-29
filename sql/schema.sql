-- =====================================================================
-- Chow-app : Supabase Schema
-- รันไฟล์นี้ใน Supabase Studio > SQL Editor (รันทีละไฟล์: schema -> policies -> seed)
-- หมายเหตุ: Claude Code เข้าถึง Supabase instance ไม่ได้ ต้องให้เฟิสท์รัน SQL เอง
-- =====================================================================

-- gen_random_uuid() ใช้ได้เลยใน Supabase (pgcrypto preinstalled)

-- ---------- 0) APP SETTINGS (เก็บ PIN, ค่าระบบ) ----------
create table if not exists app_settings (
  key   text primary key,
  value text
);

-- ---------- 1) MEMBERS (สมาชิกครอบครัว ใช้ซ้ำทุกหน้า) ----------
create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default '#888888',  -- hex สำหรับ tag/avatar
  emoji       text,                              -- avatar emoji
  sort_order  int  not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- 2) GALLERY (รูปครอบครัวหน้าแรก) ----------
create table if not exists family_photos (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,        -- path ใน bucket 'gallery'
  caption      text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------- 3) NOTES (โน้ตครอบครัว + tag คน) ----------
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  created_by  uuid references members(id) on delete set null,
  pinned      boolean not null default false,
  done        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists note_members (   -- โน้ต 1 อัน tag ได้หลายคน
  note_id   uuid references notes(id)   on delete cascade,
  member_id uuid references members(id) on delete cascade,
  primary key (note_id, member_id)
);

-- ---------- 4) RESTAURANTS + MENUS + ORDERS (สั่งอาหารล่วงหน้า) ----------
create table if not exists restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  note        text,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name          text not null,
  price         numeric,
  sort_order    int not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ออเดอร์ 1 ใบ = ร้าน 1 ร้าน ต่อ 1 วัน (เปิดให้ทุกคนมาเติมเมนูของตัวเอง)
create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  order_date    date not null default current_date,   -- ฝั่ง client ใช้ todayISO()
  status        text not null default 'open',          -- open | called | done
  created_at    timestamptz not null default now()
);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,
  member_id    uuid references members(id) on delete set null,   -- ใครสั่ง
  menu_item_id uuid references menu_items(id) on delete set null,
  menu_name    text not null,        -- snapshot ชื่อเมนู (กันเมนูถูกลบ)
  qty          int not null default 1,
  note         text,                 -- เช่น "เผ็ดน้อย"
  created_at   timestamptz not null default now()
);

-- ---------- 5) EVENTS (ปฏิทินรวม: นัดหมาย + สิทธิประโยชน์) ----------
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null default 'appointment', -- appointment | benefit
  event_date  date not null,
  event_time  time,
  location    text,
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists event_members (
  event_id  uuid references events(id)   on delete cascade,
  member_id uuid references members(id)  on delete cascade,
  primary key (event_id, member_id)
);

-- ---------- 6) INSURANCE (ประกันชีวิต/สุขภาพ) ----------
create table if not exists insurance_policies (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid references members(id) on delete set null, -- เจ้าของ
  insurance_type     text,        -- ชีวิต | สุขภาพ | อุบัติเหตุ | โรคร้ายแรง
  company            text,        -- บริษัทประกัน
  policy_name        text,        -- ชื่อกรมธรรม์
  policy_number      text,        -- เลขกรมธรรม์ (อ่อนไหว)
  agent_name         text,        -- นายหน้า/ตัวแทน
  agent_phone        text,
  beneficiary        text,        -- ผู้รับผลประโยชน์
  sum_assured        numeric,     -- ทุนประกัน
  premium            numeric,     -- เบี้ยต่องวด
  premium_frequency  text default 'year', -- year | semi | quarter | month
  payment_years      int,         -- ชำระกี่ปี
  start_date         date,        -- วันเริ่ม
  coverage_end_date  date,        -- คุ้มครองถึง
  next_due_date      date,        -- กำหนดจ่ายงวดถัดไป
  installment_current int,        -- งวดที่
  installment_total   int,        -- จากทั้งหมด
  tax_deductible     numeric,     -- ยอดที่ลดหย่อนได้ (กรอกเอง)
  status             text not null default 'active', -- active | closed | paidup
  doc_path           text,        -- ไฟล์กรมธรรม์ (bucket 'documents' - private)
  note               text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- 7) VEHICLES (รถ + ภาษี + ประกันรถ) ----------
create table if not exists vehicles (
  id                     uuid primary key default gen_random_uuid(),
  category               text not null default 'family',  -- family | company
  nickname               text,        -- ชื่อเล่นรถ
  brand                  text,
  model                  text,
  year                   int,
  license_plate          text,        -- ทะเบียน (อ่อนไหว)
  province               text,        -- จังหวัดทะเบียน
  tax_due_date           date,        -- ต่อภาษีครบกำหนด
  cmi_due_date           date,        -- พ.ร.บ. หมด
  insurance_company      text,        -- ประกันภาคสมัครใจ
  insurance_class        text,        -- ชั้น 1 | 2+ | 3+ | 3
  insurance_policy_number text,
  insurance_due_date     date,
  last_mileage           int,
  next_service_mileage   int,
  next_service_date      date,
  reg_book_image_path    text,        -- รูปเล่มทะเบียน (private)
  insurance_image_path   text,        -- รูปประกันรถ (private)
  note                   text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index if not exists idx_notes_pinned       on notes(pinned, created_at desc);
create index if not exists idx_orders_date        on orders(order_date, status);
create index if not exists idx_order_items_order   on order_items(order_id);
create index if not exists idx_menu_restaurant     on menu_items(restaurant_id);
create index if not exists idx_events_date         on events(event_date);
create index if not exists idx_insurance_owner     on insurance_policies(owner_id);
create index if not exists idx_insurance_due       on insurance_policies(next_due_date);
create index if not exists idx_vehicles_category   on vehicles(category);

-- ---------- ENABLE RLS (policies อยู่ในไฟล์ policies.sql) ----------
alter table app_settings        enable row level security;
alter table members             enable row level security;
alter table family_photos       enable row level security;
alter table notes               enable row level security;
alter table note_members        enable row level security;
alter table restaurants         enable row level security;
alter table menu_items          enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table events              enable row level security;
alter table event_members       enable row level security;
alter table insurance_policies  enable row level security;
alter table vehicles            enable row level security;
