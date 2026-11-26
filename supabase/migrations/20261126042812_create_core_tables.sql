/*
# Create core tables: products, app_settings, price_proofs, orders

This migration creates the four tables used by the ChiNed app:
1. products — stores the product catalog (synced from admin and localStorage)
2. app_settings — stores a single settings row (id='default') with settings and legal JSON blobs
3. price_proofs — stores price comparison proof cards shown on the storefront
4. orders — stores customer order data as JSON

## New Tables
### products
- id (text, primary key) — product identifier (e.g. "p1688-1", "1688-12345")
- product_data (jsonb, not null) — full Product object as JSON
- updated_at (timestamptz) — last sync timestamp

### app_settings
- id (text, primary key, default 'default') — singleton row
- settings (jsonb) — Settings object as JSON
- legal (jsonb) — LegalDocs object as JSON
- updated_at (timestamptz)

### price_proofs
- id (text, primary key) — proof identifier (e.g. "proof-boots")
- proof (jsonb, not null) — PriceProof object as JSON
- updated_at (timestamptz)

### orders
- id (text, primary key) — order identifier (e.g. "order-123")
- order_data (jsonb, not null) — full Order object as JSON
- updated_at (timestamptz)

## Security
- RLS enabled on all four tables.
- This is a no-auth storefront app (anon-key client), so all policies use TO anon, authenticated.
- products: public read, public write (admin manages catalog via anon key).
- app_settings: public read, public write (admin updates settings).
- price_proofs: public read, public write.
- orders: public read and insert (customers place orders), public update (admin updates status), no delete (data preservation).
*/

-- products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  product_data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
TO anon, authenticated USING (true);

-- app_settings table (singleton — id='default')
CREATE TABLE IF NOT EXISTS app_settings (
  id text PRIMARY KEY DEFAULT 'default',
  settings jsonb,
  legal jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON app_settings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- price_proofs table
CREATE TABLE IF NOT EXISTS price_proofs (
  id text PRIMARY KEY,
  proof jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE price_proofs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON price_proofs TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_price_proofs" ON price_proofs;
CREATE POLICY "anon_select_price_proofs" ON price_proofs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_price_proofs" ON price_proofs;
CREATE POLICY "anon_insert_price_proofs" ON price_proofs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_price_proofs" ON price_proofs;
CREATE POLICY "anon_update_price_proofs" ON price_proofs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- orders table
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
