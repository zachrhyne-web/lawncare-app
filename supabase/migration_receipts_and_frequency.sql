-- Adds receipt storage for expenses + a public receipts bucket.
-- Service frequency is stored inside customer.job_details JSONB — no schema change needed.
-- Run this in Supabase SQL Editor.

alter table public.expenses
  add column if not exists receipt_url text,
  add column if not exists receipt_path text;

-- Receipts bucket
insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', true)
  on conflict (id) do nothing;

drop policy if exists "receipts_read" on storage.objects;
create policy "receipts_read" on storage.objects
  for select using (bucket_id = 'receipts');

drop policy if exists "receipts_write" on storage.objects;
create policy "receipts_write" on storage.objects
  for insert with check (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "receipts_update" on storage.objects;
create policy "receipts_update" on storage.objects
  for update using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "receipts_delete" on storage.objects;
create policy "receipts_delete" on storage.objects
  for delete using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
