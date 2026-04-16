-- LawnCare Pro — Multi-tenant schema
-- Run this in your Supabase project: SQL Editor → New Query → paste → Run

-- ─────────────────────────────────────────────────────────────
-- PROFILES  (1:1 with auth.users — holds business + brand info)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  owner_name text,
  phone text,
  email text,
  address text,
  tagline text,
  logo_url text,
  primary_color text default '#1B3D1B',
  accent_color text default '#E8C000',
  tax_rate numeric default 0,
  invoice_prefix text default 'INV',
  next_invoice_number integer default 1,
  is_setup_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  services jsonb default '{"mow":false,"weedeat":false,"edge":false,"blowing":false}'::jsonb,
  equipment jsonb default '{}'::jsonb,
  job_details jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists customers_user_id_idx on public.customers(user_id);

alter table public.customers enable row level security;

drop policy if exists "customers_all_own" on public.customers;
create policy "customers_all_own" on public.customers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- CUSTOMER PHOTOS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.customer_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null check (label in ('before','after')),
  storage_path text not null,
  public_url text,
  uploaded_at timestamptz default now()
);

create index if not exists customer_photos_customer_idx on public.customer_photos(customer_id);

alter table public.customer_photos enable row level security;

drop policy if exists "customer_photos_all_own" on public.customer_photos;
create policy "customer_photos_all_own" on public.customer_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_number text not null,
  customer_snapshot jsonb default '{}'::jsonb,
  business_info jsonb default '{}'::jsonb,
  date date not null,
  due_date date,
  status text not null default 'draft' check (status in ('draft','sent','paid')),
  line_items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  tax_rate numeric default 0,
  tax_amount numeric default 0,
  total numeric default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_customer_idx on public.invoices(customer_id);

alter table public.invoices enable row level security;

drop policy if exists "invoices_all_own" on public.invoices;
create policy "invoices_all_own" on public.invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('brand-assets', 'brand-assets', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('customer-photos', 'customer-photos', true)
  on conflict (id) do nothing;

-- Storage policies — users can only upload/modify files in a folder named after their user id
drop policy if exists "brand_assets_read" on storage.objects;
create policy "brand_assets_read" on storage.objects
  for select using (bucket_id = 'brand-assets');

drop policy if exists "brand_assets_write" on storage.objects;
create policy "brand_assets_write" on storage.objects
  for insert with check (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "brand_assets_update" on storage.objects;
create policy "brand_assets_update" on storage.objects
  for update using (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "brand_assets_delete" on storage.objects;
create policy "brand_assets_delete" on storage.objects
  for delete using (
    bucket_id = 'brand-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "customer_photos_read" on storage.objects;
create policy "customer_photos_read" on storage.objects
  for select using (bucket_id = 'customer-photos');

drop policy if exists "customer_photos_write" on storage.objects;
create policy "customer_photos_write" on storage.objects
  for insert with check (
    bucket_id = 'customer-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "customer_photos_update" on storage.objects;
create policy "customer_photos_update" on storage.objects
  for update using (
    bucket_id = 'customer-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "customer_photos_delete" on storage.objects;
create policy "customer_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'customer-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
