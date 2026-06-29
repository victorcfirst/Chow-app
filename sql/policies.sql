-- =====================================================================
-- Chow-app : RLS Policies (MVP)
-- รูปแบบเดียวกับ CK-app: anon เข้าถึงได้ทั้งหมด เพราะกั้นด้วย PIN ฝั่ง client
--
-- ⚠️ สำคัญ: PIN เป็นเพียง "ประตูนุ่ม" ฝั่ง client เท่านั้น ใครที่มี URL + anon key
--    (ซึ่งติดมากับ bundle) สามารถอ่าน/เขียนข้อมูลได้โดยตรง
--    ถ้าต้องการป้องกันข้อมูลประกัน/รถจริงจัง ให้ย้ายไป Supabase Auth (login รายคน)
--    ในเฟสถัดไป — รายละเอียดอยู่ใน PLAN.md หัวข้อ "Security & Privacy"
-- =====================================================================

-- helper: สร้าง policy แบบ allow-all ให้ anon + authenticated
do $$
declare t text;
begin
  foreach t in array array[
    'app_settings','members','family_photos','notes','note_members',
    'restaurants','menu_items','orders','order_items',
    'events','event_members','insurance_policies','vehicles'
  ]
  loop
    execute format('drop policy if exists chow_all on %I;', t);
    execute format(
      'create policy chow_all on %I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
