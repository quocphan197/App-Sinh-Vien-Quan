-- -------------------------------------------------------------
-- SUPABASE SCHEMA FOR SINH VIÊN QUÁN MVP
-- -------------------------------------------------------------

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table public.categories (
    id text primary key,
    name text not null,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- 2. PRODUCTS TABLE
create table public.products (
    id text primary key,
    name text not null,
    description text,
    price numeric not null check (price >= 0),
    original_price numeric check (original_price >= 0),
    image_url text,
    is_combo boolean not null default false,
    prep_time text default '5 phút',
    status_text text default 'Sẵn sàng ngay',
    tags text[] default '{}',
    category_id text references public.categories(id) on delete set null,
    stock_quantity integer not null default 999 check (stock_quantity >= 0),
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- 3. PROFILES TABLE (linked to auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text,
    mssv text,
    university text default 'Trường Đại học Công Nghiệp - IUH',
    point_balance integer not null default 0 check (point_balance >= 0),
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- 4. CART_ITEMS TABLE
create table public.cart_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id text not null references public.products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    created_at timestamptz default now(),
    unique (user_id, product_id)
);

-- Enable RLS
alter table public.cart_items enable row level security;

-- 5. ADDRESSES TABLE
create table public.addresses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    label text not null,
    description text not null,
    is_default boolean not null default false,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.addresses enable row level security;

-- 6. ORDERS TABLE
create table public.orders (
    id text primary key, -- e.g., 'SVQ-123456'
    user_id uuid not null references auth.users(id) on delete cascade,
    total_amount numeric not null check (total_amount >= 0),
    discount_amount numeric not null default 0 check (discount_amount >= 0),
    prep_fee numeric not null default 3000 check (prep_fee >= 0),
    final_amount numeric not null check (final_amount >= 0),
    payment_method text not null check (payment_method in ('cash', 'momo', 'zalopay', 'card')),
    payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    order_status text not null default 'PENDING' check (order_status in ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    notes text,
    delivery_address text not null,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- 7. ORDER_ITEMS TABLE
create table public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id text not null references public.orders(id) on delete cascade,
    product_id text not null references public.products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    price_at_purchase numeric not null check (price_at_purchase >= 0),
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.order_items enable row level security;

-- 8. PAYMENTS TABLE
create table public.payments (
    id uuid primary key default gen_random_uuid(),
    order_id text not null references public.orders(id) on delete cascade,
    payment_provider text not null, -- e.g., 'cash', 'payos', 'momo'
    transaction_id text,
    amount numeric not null check (amount >= 0),
    status text not null default 'PENDING',
    raw_response jsonb,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.payments enable row level security;


-- -------------------------------------------------------------
-- AUTOMATIC PROFILE TRIGGER ON USER SIGN-UP
-- -------------------------------------------------------------

-- Create user handler function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------

-- Helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- POLICY: categories (anyone can read, admins can write)
create policy "Allow public read categories" on public.categories
    for select using (true);
create policy "Allow admin write categories" on public.categories
    for all using (public.is_admin());

-- POLICY: products (anyone can read, admins can write)
create policy "Allow public read products" on public.products
    for select using (true);
create policy "Allow admin write products" on public.products
    for all using (public.is_admin());

-- POLICY: profiles (users can view/edit their own profile, admins can read/write all)
create policy "Allow users to view own profile" on public.profiles
    for select using (auth.uid() = id or public.is_admin());
create policy "Allow users to update own profile" on public.profiles
    for update using (auth.uid() = id or public.is_admin());
create policy "Allow admin all profiles" on public.profiles
    for all using (public.is_admin());

-- POLICY: cart_items (users can manage their own cart items)
create policy "Allow users own cart read" on public.cart_items
    for select using (auth.uid() = user_id);
create policy "Allow users own cart insert" on public.cart_items
    for insert with check (auth.uid() = user_id);
create policy "Allow users own cart update" on public.cart_items
    for update using (auth.uid() = user_id);
create policy "Allow users own cart delete" on public.cart_items
    for delete using (auth.uid() = user_id);

-- POLICY: addresses (users can manage their own addresses)
create policy "Allow users own addresses read" on public.addresses
    for select using (auth.uid() = user_id);
create policy "Allow users own addresses insert" on public.addresses
    for insert with check (auth.uid() = user_id);
create policy "Allow users own addresses update" on public.addresses
    for update using (auth.uid() = user_id);
create policy "Allow users own addresses delete" on public.addresses
    for delete using (auth.uid() = user_id);

-- POLICY: orders (users can view their own orders, serverless function/admin can view/edit all)
create policy "Allow users own orders read" on public.orders
    for select using (auth.uid() = user_id or public.is_admin());
create policy "Allow users own orders insert" on public.orders
    for insert with check (auth.uid() = user_id or public.is_admin());
create policy "Allow admin all orders" on public.orders
    for all using (public.is_admin());

-- POLICY: order_items (users can view their own order items)
create policy "Allow users own order_items read" on public.order_items
    for select using (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id and (orders.user_id = auth.uid() or public.is_admin())
        )
    );
create policy "Allow admin all order_items" on public.order_items
    for all using (public.is_admin());

-- POLICY: payments (users can view their own payments)
create policy "Allow users own payments read" on public.payments
    for select using (
        exists (
            select 1 from public.orders
            where orders.id = payments.order_id and (orders.user_id = auth.uid() or public.is_admin())
        )
    );
create policy "Allow admin all payments" on public.payments
    for all using (public.is_admin());
