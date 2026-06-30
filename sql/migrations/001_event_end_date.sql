-- Migration 001: เพิ่ม event_end_date สำหรับนัดหมายแบบช่วงหลายวัน
-- รันใน Supabase Studio > SQL Editor

alter table events
  add column if not exists event_end_date date;
