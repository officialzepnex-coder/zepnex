-- ZEPNEX / BrandMart admin schema
-- Run this in Supabase → SQL Editor (once per project).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles (admin flag)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.brands (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  tagline text not null default '',
  logo text not null default '',
  cover_image text not null default '',
  location text not null default '',
  rating numeric(3,1) not null default 0,
  reviews int not null default 0,
  followers int not null default 0,
  product_count int not null default 0,
  description text not null default '',
  verified boolean not null default false,
  website text,
  contact_email text,
  featured boolean not null default true,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  brand_id text not null references public.brands (id) on delete cascade,
  brand_name text not null default '',
  category text not null default 'Daily Use',
  price numeric(12,2) not null default 0,
  original_price numeric(12,2),
  rating numeric(3,1) not null default 0,
  reviews int not null default 0,
  image text not null default '',
  images text[] default '{}',
  description text not null default '',
  in_stock boolean not null default true,
  stock_quantity int not null default 0,
  badge text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  sort_order int not null default 0,
  published boolean not null default true,
  icon text not null default 'Folder'
);

create table if not exists public.reviews (
  id text primary key default gen_random_uuid()::text,
  kind text not null default 'brand' check (kind in ('homepage', 'brand', 'product')),
  brand_id text references public.brands (id) on delete cascade,
  product_id text references public.products (id) on delete cascade,
  author text not null,
  role text,
  rating int not null default 5 check (rating between 1 and 5),
  comment text not null,
  avatar text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_applications (
  id text primary key default gen_random_uuid()::text,
  brand_name text not null,
  email text not null,
  phone text,
  category text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id text primary key default gen_random_uuid()::text,
  question text not null,
  answer text not null,
  category text not null default 'General',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  role text not null default '',
  image text not null default '',
  bio text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories add column if not exists icon text not null default 'Folder';
alter table public.faqs add column if not exists category text not null default 'General';

create index if not exists brands_published_name_idx on public.brands (published, name);
create index if not exists products_published_name_idx on public.products (published, name);
create index if not exists products_published_category_idx on public.products (published, category);
create index if not exists categories_published_sort_idx on public.categories (published, sort_order);
create index if not exists reviews_published_created_idx on public.reviews (published, created_at desc);
create index if not exists reviews_published_kind_idx on public.reviews (published, kind);
create index if not exists faqs_published_sort_idx on public.faqs (published, sort_order);
create index if not exists team_members_published_sort_idx on public.team_members (published, sort_order);
create index if not exists applications_status_created_idx on public.brand_applications (status, created_at desc);
create index if not exists profiles_role_idx on public.profiles (role);

drop trigger if exists brands_updated_at on public.brands;
create trigger brands_updated_at before update on public.brands
  for each row execute function public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

drop trigger if exists applications_updated_at on public.brand_applications;
create trigger applications_updated_at before update on public.brand_applications
  for each row execute function public.set_updated_at();

drop trigger if exists faqs_updated_at on public.faqs;
create trigger faqs_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

drop trigger if exists team_members_updated_at on public.team_members;
create trigger team_members_updated_at before update on public.team_members
  for each row execute function public.set_updated_at();

-- Keep product.brand_name in sync
create or replace function public.sync_product_brand_name()
returns trigger
language plpgsql
as $$
begin
  select name into new.brand_name from public.brands where id = new.brand_id;
  return new;
end;
$$;

drop trigger if exists products_sync_brand_name on public.products;
create trigger products_sync_brand_name
  before insert or update of brand_id on public.products
  for each row execute function public.sync_product_brand_name();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.reviews enable row level security;
alter table public.brand_applications enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands public read" on public.brands;
create policy "brands public read" on public.brands
  for select using (published = true or public.is_admin());

drop policy if exists "brands admin write" on public.brands;
create policy "brands admin write" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (published = true or public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (published = true or public.is_admin());

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews
  for select using (published = true or public.is_admin());

drop policy if exists "reviews admin write" on public.reviews;
create policy "reviews admin write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "applications public insert" on public.brand_applications;
create policy "applications public insert" on public.brand_applications
  for insert with check (true);

drop policy if exists "applications admin read" on public.brand_applications;
create policy "applications admin read" on public.brand_applications
  for select using (public.is_admin());

drop policy if exists "applications admin write" on public.brand_applications;
create policy "applications admin write" on public.brand_applications
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "applications admin delete" on public.brand_applications;
create policy "applications admin delete" on public.brand_applications
  for delete using (public.is_admin());

drop policy if exists "team members public read" on public.team_members;
create policy "team members public read" on public.team_members
  for select using (published = true or public.is_admin());

drop policy if exists "team members admin write" on public.team_members;
create policy "team members admin write" on public.team_members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs public read" on public.faqs;
create policy "faqs public read" on public.faqs
  for select using (published = true or public.is_admin());

drop policy if exists "faqs admin write" on public.faqs;
create policy "faqs admin write" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings
  for select using (true);

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage (optional image uploads from admin)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

drop policy if exists "brand assets public read" on storage.objects;
create policy "brand assets public read" on storage.objects
  for select using (bucket_id = 'brand-assets');

drop policy if exists "brand assets admin write" on storage.objects;
create policy "brand assets admin write" on storage.objects
  for all using (bucket_id = 'brand-assets' and public.is_admin())
  with check (bucket_id = 'brand-assets' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed catalog (safe to re-run)
-- ---------------------------------------------------------------------------
insert into public.team_members (id, name, role, image, bio, sort_order, published) values
  ('team-1', 'Aarav Sharma', 'Head of Growth', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'Drives acquisition, partnerships, and marketplace scale across India.', 1, true),
  ('team-2', 'Meera Kapoor', 'Brand Partnerships Lead', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'Builds relationships with emerging brands and helps them launch faster.', 2, true),
  ('team-3', 'Rohan Verma', 'Marketplace Operations', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 'Makes sure every order, listing, and delivery flow runs smoothly.', 3, true),
  ('team-4', 'Nisha Sethi', 'Customer Experience', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80', 'Creates a trusted and effortless shopping experience for every customer.', 4, true),
  ('team-5', 'Karan Malhotra', 'UI & Experience Designer', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80', 'Shapes the aesthetic and product experience across ZEPNEX touchpoints.', 5, true),
  ('team-6', 'Sana Ali', 'AI Product Specialist', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 'Helps build intelligence features that guide shoppers and sellers better.', 6, true)
on conflict (id) do nothing;

insert into public.categories (id, name, sort_order, published) values
  ('clothing', 'Clothing', 1, true),
  ('daily-use', 'Daily Use', 2, true),
  ('electronics', 'Electronics', 3, true),
  ('home-living', 'Home & Living', 4, true),
  ('beauty', 'Beauty', 5, true),
  ('sports', 'Sports', 6, true)
on conflict (id) do nothing;

insert into public.brands (
  id, name, tagline, logo, cover_image, location, rating, reviews, followers,
  product_count, description, verified, website, contact_email, featured, published
) values
  ('brand-1', 'TrendStyle Co.', 'Premium Fashion for Everyone',
   'https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=c084fc&textColor=ffffff',
   'https://img.rocket.new/generatedImages/rocket_gen_img_2bc4c88d8-1773225914256.png',
   'Mumbai, India', 4.8, 324, 5200, 145,
   'Contemporary fashion brand specializing in casual wear and trendy apparel for fashion-forward individuals.',
   true, 'https://example.com', 'info@trendstyle.com', true, true),
  ('brand-2', 'EcoHome Living', 'Sustainable Home Solutions',
   'https://api.dicebear.com/7.x/initials/svg?seed=EL&backgroundColor=10b981&textColor=ffffff',
   'https://img.rocket.new/generatedImages/rocket_gen_img_653d2e45c-1773225914457.png',
   'Bangalore, India', 4.6, 287, 3800, 98,
   'Eco-friendly home products designed with sustainability in mind. From organic linens to bamboo furniture.',
   true, 'https://example.com', 'support@ecohome.com', true, true),
  ('brand-3', 'TechGear Pro', 'Next-Gen Electronics',
   'https://api.dicebear.com/7.x/initials/svg?seed=TG&backgroundColor=3b82f6&textColor=ffffff',
   'https://img.rocket.new/generatedImages/rocket_gen_img_a7f9e12b5-1773225914658.png',
   'Delhi, India', 4.7, 412, 6100, 187,
   'Leading electronics brand offering innovative gadgets, accessories, and smart home solutions.',
   true, 'https://example.com', 'hello@techgearpro.com', true, true),
  ('brand-4', 'BeautyEssence', 'Natural Beauty Products',
   'https://api.dicebear.com/7.x/initials/svg?seed=BE&backgroundColor=ec4899&textColor=ffffff',
   'https://img.rocket.new/generatedImages/rocket_gen_img_f2c3a91d7-1773225914859.png',
   'Pune, India', 4.9, 568, 7400, 156,
   'Premium beauty and skincare brand with natural ingredients. Cruelty-free and dermatologist-tested products.',
   true, 'https://example.com', 'care@beautyessence.com', true, true),
  ('brand-5', 'SportZone', 'Athletic Excellence',
   'https://api.dicebear.com/7.x/initials/svg?seed=SZ&backgroundColor=f97316&textColor=ffffff',
   'https://img.rocket.new/generatedImages/rocket_gen_img_e4a2f67c9-1773225915060.png',
   'Hyderabad, India', 4.5, 291, 4900, 112,
   'Complete range of sports equipment, athletic wear, and fitness accessories for all skill levels.',
   true, 'https://example.com', 'support@sportzone.com', true, true),
  ('brand-6', 'GourmetSnacks', 'Artisanal & Healthy Snacking',
   'https://api.dicebear.com/7.x/initials/svg?seed=GS&backgroundColor=8b5cf6&textColor=ffffff',
   'https://img.rocket.new/generatedImages/rocket_gen_img_d5b8e73a2-1773225915261.png',
   'Ahmedabad, India', 4.4, 156, 2300, 67,
   'Premium artisanal snacks and gourmet food products. Healthy, organic, and delicious.',
   false, 'https://example.com', 'hello@gourmetsnacks.com', true, true)
on conflict (id) do nothing;

insert into public.products (
  id, name, brand_id, brand_name, category, price, original_price, rating, reviews,
  image, description, in_stock, badge, featured, published
) values
  ('prod-1', 'Classic Cotton T-Shirt', 'brand-1', 'TrendStyle Co.', 'Clothing', 499, 999, 4.6, 234,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product1&scale=80',
   'Premium quality cotton t-shirt with perfect fit. Available in multiple colors.', true, 'Sale', true, true),
  ('prod-2', 'Slim Fit Jeans', 'brand-1', 'TrendStyle Co.', 'Clothing', 1299, 2499, 4.7, 189,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product2&scale=80',
   'Trendy slim fit jeans with premium denim fabric. Comfortable and durable.', true, 'Sale', false, true),
  ('prod-3', 'Summer Casual Shorts', 'brand-1', 'TrendStyle Co.', 'Clothing', 699, null, 4.5, 123,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product3&scale=80',
   'Light and breathable shorts perfect for summer. Multiple color options available.', true, null, false, true),
  ('prod-4', 'Organic Cotton Bedsheet Set', 'brand-2', 'EcoHome Living', 'Home & Living', 2499, 3999, 4.8, 287,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product4&scale=80',
   'Premium organic cotton bedsheet set. Eco-friendly and supremely comfortable.', true, 'New', true, true),
  ('prod-5', 'Bamboo Cutting Board Set', 'brand-2', 'EcoHome Living', 'Home & Living', 899, null, 4.4, 156,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product5&scale=80',
   'Sustainable bamboo cutting board set for your kitchen. Durable and eco-friendly.', true, null, false, true),
  ('prod-6', 'Eco-Friendly Food Storage', 'brand-2', 'EcoHome Living', 'Daily Use', 1299, null, 4.6, 198,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product6&scale=80',
   'Reusable glass food storage containers. Plastic-free and sustainable solution.', true, 'Best Seller', true, true),
  ('prod-7', 'Wireless Bluetooth Earbuds', 'brand-3', 'TechGear Pro', 'Electronics', 2999, 5999, 4.7, 412,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product7&scale=80',
   'Premium wireless earbuds with active noise cancellation. 30-hour battery life.', true, 'Sale', true, true),
  ('prod-8', 'Fast Charging USB-C Cable', 'brand-3', 'TechGear Pro', 'Electronics', 399, null, 4.5, 267,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product8&scale=80',
   'Durable USB-C charging cable with fast charging support. 2-meter length.', true, null, false, true),
  ('prod-9', 'Smart LED Light Bulb', 'brand-3', 'TechGear Pro', 'Electronics', 799, null, 4.6, 324,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product9&scale=80',
   'WiFi-enabled smart bulb with 16 million color options. Voice control compatible.', true, 'New', false, true),
  ('prod-10', 'Natural Face Cleanser', 'brand-4', 'BeautyEssence', 'Beauty', 649, 1299, 4.8, 456,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product10&scale=80',
   'Gentle, natural face cleanser suitable for all skin types. Cruelty-free and organic.', true, 'Best Seller', true, true),
  ('prod-11', 'Vitamin C Serum', 'brand-4', 'BeautyEssence', 'Beauty', 1299, null, 4.9, 378,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product11&scale=80',
   'Brightening vitamin C serum. Dermatologist-tested and highly effective.', true, null, false, true),
  ('prod-12', 'Moisturizing Night Cream', 'brand-4', 'BeautyEssence', 'Beauty', 899, null, 4.7, 289,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product12&scale=80',
   'Rich night cream with natural ingredients. Restore and rejuvenate your skin.', true, null, false, true),
  ('prod-13', 'Professional Yoga Mat', 'brand-5', 'SportZone', 'Sports', 1499, 2499, 4.6, 267,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product13&scale=80',
   'Non-slip yoga mat with extra cushioning. Lightweight and eco-friendly TPE material.', true, 'Sale', true, true),
  ('prod-14', 'Adjustable Dumbbells Set', 'brand-5', 'SportZone', 'Sports', 3999, null, 4.8, 345,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product14&scale=80',
   'Adjustable dumbbells from 5kg to 25kg. Perfect for home workouts.', true, 'New', false, true),
  ('prod-15', 'Running Shoes', 'brand-5', 'SportZone', 'Sports', 2999, 4999, 4.7, 198,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product15&scale=80',
   'Comfortable running shoes with advanced cushioning technology.', true, 'Sale', false, true),
  ('prod-16', 'Roasted Almonds Mix', 'brand-6', 'GourmetSnacks', 'Daily Use', 349, 599, 4.5, 123,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product16&scale=80',
   'Premium roasted almonds with no added sugar. Healthy and delicious.', true, 'Best Seller', true, true),
  ('prod-17', 'Organic Granola Cereal', 'brand-6', 'GourmetSnacks', 'Daily Use', 299, null, 4.4, 89,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product17&scale=80',
   'Organic granola cereal with natural honey and dried fruits.', true, null, false, true),
  ('prod-18', 'Dark Chocolate Bars Pack', 'brand-6', 'GourmetSnacks', 'Daily Use', 499, null, 4.6, 145,
   'https://api.dicebear.com/7.x/avataaars/svg?seed=product18&scale=80',
   'Premium dark chocolate bars with 70% cocoa. Pack of 5.', true, null, false, true)
on conflict (id) do nothing;

insert into public.reviews (id, kind, brand_id, author, role, rating, comment, published) values
  ('rev-1', 'homepage', null, 'Ananya Mehta', 'Mumbai', 5, 'Found unique brands I never would have discovered otherwise. Quality is consistently excellent.', true),
  ('rev-2', 'homepage', null, 'Rahul Iyer', 'Bengaluru', 5, 'Prices are fair and the curated brands feel premium without the usual marketplace chaos.', true),
  ('rev-3', 'homepage', null, 'Sana Qureshi', 'Delhi', 4, 'Love shopping from small Indian labels in one place. Delivery and packaging were solid.', true),
  ('rev-4', 'brand', 'brand-1', 'Rahul Kumar', null, 5, 'Excellent quality products and fast delivery. Highly recommended!', true),
  ('rev-5', 'brand', 'brand-1', 'Priya Singh', null, 4, 'Good products but could improve on packaging.', true),
  ('rev-6', 'brand', 'brand-3', 'Amit Patel', null, 5, 'Amazing experience! Will definitely order again.', true)
on conflict (id) do nothing;

insert into public.faqs (id, question, answer, sort_order, published) values
  ('faq-1', 'What are the eligibility requirements?',
   'Your brand should have at least 6 months of operation with genuine products and good customer reviews.', 1, true),
  ('faq-2', 'How long does approval take?',
   'Most applications are approved within 24-48 hours. We will notify you via email about the status.', 2, true),
  ('faq-3', 'Can I list multiple product categories?',
   'Yes! You can list products from different categories. We support multiple categories per brand.', 3, true)
on conflict (id) do nothing;

insert into public.site_settings (key, value) values
  ('homepage', '{
    "eyebrow": "India''s Premier Multi-Brand Marketplace",
    "title": "Every Brand You Love,",
    "highlight": "One Place to Shop",
    "subtitle": "Discover unique small brands, trending clothes, and daily essentials — curated for everyday shoppers, style hunters, budget families, and loyal brand followers.",
    "image": "https://img.rocket.new/generatedImages/rocket_gen_img_153c96c78-1773225913955.png",
    "ctaPrimary": "Shop Products",
    "ctaSecondary": "Explore Brands"
  }'::jsonb)
on conflict (key) do nothing;

-- After you create your first Auth user, promote them:
-- update public.profiles set role = 'admin' where email = 'you@yourdomain.com';
