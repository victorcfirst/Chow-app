-- Migration 002: สร้าง storage buckets + policies สำหรับ gallery และ documents
-- รันใน Supabase Studio > SQL Editor
-- แก้ปัญหา "อัปโหลดไม่สำเร็จ: new row violates row-level security policy"

-- สร้าง bucket gallery (public) ถ้ายังไม่มี
insert into storage.buckets (id, name, public, file_size_limit)
values ('gallery', 'gallery', true, 10485760)   -- 10 MB limit
on conflict (id) do update set public = true;

-- สร้าง bucket documents (private) ถ้ายังไม่มี
insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 20971520)   -- 20 MB limit
on conflict (id) do nothing;

-- Storage policies สำหรับ gallery bucket (anon อ่าน/เขียน/ลบได้)
drop policy if exists "gallery_all" on storage.objects;
create policy "gallery_all" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'gallery')
  with check (bucket_id = 'gallery');

-- Storage policies สำหรับ documents bucket (anon อ่าน/เขียน/ลบได้ — private URL ป้องกันแล้ว)
drop policy if exists "documents_all" on storage.objects;
create policy "documents_all" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');
