-- =====================================================================
-- Chow-app : Seed data
-- =====================================================================

-- ---------- PIN เริ่มต้น (เปลี่ยนได้ภายหลังในตาราง app_settings) ----------
insert into app_settings (key, value) values ('pin', '1234')
on conflict (key) do nothing;

-- ---------- สมาชิกครอบครัว ----------
insert into members (name, color, emoji, sort_order) values
  ('หม่าม๊า', '#E91E63', '👩', 1),
  ('เฟิสท์',  '#1E88E5', '🧑', 2),
  ('มิ้นท์',  '#43A047', '👧', 3),
  ('บอส',    '#FB8C00', '🧑', 4),
  ('วิน',    '#8E24AA', '🧒', 5)
on conflict do nothing;

-- ---------- ตัวอย่างร้านอาหาร + เมนู (ไว้ทดสอบหน้า Restaurants) ----------
with r as (
  insert into restaurants (name, phone, note, sort_order)
  values ('ลาบยะโส นายจ่อย', '081-234-5678', 'ร้านประจำ เปิด 8 โมง', 1)
  returning id
)
insert into menu_items (restaurant_id, name, price, sort_order)
select r.id, m.name, m.price, m.ord
from r, (values
  ('ลาบหมู', 60, 1),
  ('น้ำตกหมู', 60, 2),
  ('ส้มตำไทย', 40, 3),
  ('ไก่ย่าง', 80, 4),
  ('ข้าวเหนียว', 10, 5)
) as m(name, price, ord);
