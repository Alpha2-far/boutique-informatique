-- GQ Store Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Categories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  slug text not null unique,
  icone text,
  ordre int default 0,
  created_at timestamptz default now()
);

-- 2. Products
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  slug text not null unique,
  description text,
  prix numeric not null,
  categorie_id uuid references categories(id) on delete set null,
  etat text check (etat in ('neuf', 'occasion')) default 'neuf',
  stock int default 0,
  en_vedette boolean default false,
  actif boolean default true,
  created_at timestamptz default now()
);

-- 3. Product Images
create table if not exists product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  cloudinary_url text not null,
  cloudinary_public_id text not null,
  est_principale boolean default false,
  ordre int default 0
);

-- 4. Product Specs
create table if not exists product_specs (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  icone text,
  libelle text not null,
  valeur text not null,
  ordre int default 0
);

-- 5. Product Reviews
create table if not exists product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_specs enable row level security;
alter table product_reviews enable row level security;

-- Public read policies
create policy "Public read categories" on categories for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read product_images" on product_images for select using (true);
create policy "Public read product_specs" on product_specs for select using (true);
create policy "Public read product_reviews" on product_reviews for select using (true);

-- Authenticated write policies (admin)
create policy "Admin insert categories" on categories for insert to authenticated with check (true);
create policy "Admin update categories" on categories for update to authenticated using (true);
create policy "Admin delete categories" on categories for delete to authenticated using (true);

create policy "Admin insert products" on products for insert to authenticated with check (true);
create policy "Admin update products" on products for update to authenticated using (true);
create policy "Admin delete products" on products for delete to authenticated using (true);

create policy "Admin insert product_images" on product_images for insert to authenticated with check (true);
create policy "Admin update product_images" on product_images for update to authenticated using (true);
create policy "Admin delete product_images" on product_images for delete to authenticated using (true);

create policy "Admin insert product_specs" on product_specs for insert to authenticated with check (true);
create policy "Admin update product_specs" on product_specs for update to authenticated using (true);
create policy "Admin delete product_specs" on product_specs for delete to authenticated using (true);

create policy "Admin insert product_reviews" on product_reviews for insert to authenticated with check (true);
create policy "Admin update product_reviews" on product_reviews for update to authenticated using (true);
create policy "Admin delete product_reviews" on product_reviews for delete to authenticated using (true);
