-- HappyGo Travel production PostgreSQL schema v1
-- Designed for Vercel + PostgreSQL. Money is stored as integer VND.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','admin','sales','content','operations','accounting')),
  department text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','locked')),
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text, email text,
  status text NOT NULL DEFAULT 'lead', marketing_consent boolean NOT NULL DEFAULT false,
  source text, note text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS customers_phone_unique ON customers(phone) WHERE phone IS NOT NULL AND phone<>'';
CREATE INDEX IF NOT EXISTS customers_email_idx ON customers(lower(email));

CREATE TABLE IF NOT EXISTS customer_assignments (
  customer_id uuid PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id), source text NOT NULL DEFAULT 'round_robin',
  assigned_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sales_rotation (
  id smallint PRIMARY KEY DEFAULT 1 CHECK(id=1), last_staff_id uuid REFERENCES staff(id),
  enabled boolean NOT NULL DEFAULT false, assigned_count bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO sales_rotation(id) VALUES(1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text, phone text,
  status text NOT NULL DEFAULT 'pending', commission_percent numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), partner_id uuid REFERENCES partners(id), slug text NOT NULL UNIQUE,
  type text NOT NULL, name text NOT NULL, status text NOT NULL DEFAULT 'draft', description text,
  retail_price_vnd bigint NOT NULL DEFAULT 0 CHECK(retail_price_vnd>=0), net_price_vnd bigint CHECK(net_price_vnd>=0),
  promo_price_vnd bigint CHECK(promo_price_vnd>=0), data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  code text, name text NOT NULL, capacity integer, retail_price_vnd bigint NOT NULL DEFAULT 0,
  net_price_vnd bigint, data jsonb NOT NULL DEFAULT '{}'::jsonb, status text NOT NULL DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS rate_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES product_units(id) ON DELETE CASCADE, start_date date NOT NULL, end_date date NOT NULL,
  retail_price_vnd bigint NOT NULL, net_price_vnd bigint, inventory integer, label text,
  CHECK(end_date>=start_date)
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, customer_id uuid NOT NULL REFERENCES customers(id),
  sales_staff_id uuid REFERENCES staff(id), sales_staff_name_snapshot text,
  status text NOT NULL DEFAULT 'new', source text, start_date date, end_date date,
  adults integer NOT NULL DEFAULT 1, children integer NOT NULL DEFAULT 0, rooms integer NOT NULL DEFAULT 1,
  selling_total_vnd bigint NOT NULL DEFAULT 0 CHECK(selling_total_vnd>=0), cost_total_vnd bigint CHECK(cost_total_vnd>=0),
  currency char(3) NOT NULL DEFAULT 'VND', customer_name_snapshot text NOT NULL, phone_snapshot text, email_snapshot text,
  note text, admin_note text, sales_assigned_at timestamptz, confirmed_at timestamptz, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_sales_idx ON bookings(sales_staff_id,created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings(customer_id,created_at DESC);
CREATE TABLE IF NOT EXISTS booking_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id), unit_id uuid REFERENCES product_units(id), partner_id uuid REFERENCES partners(id),
  product_name_snapshot text NOT NULL, unit_name_snapshot text, quantity integer NOT NULL DEFAULT 1,
  selling_price_vnd bigint NOT NULL DEFAULT 0, cost_price_vnd bigint, data_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), booking_id uuid NOT NULL REFERENCES bookings(id),
  type text NOT NULL DEFAULT 'deposit', amount_vnd bigint NOT NULL CHECK(amount_vnd>0), status text NOT NULL DEFAULT 'pending',
  provider text, provider_reference text, paid_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_ref_unique ON payments(provider,provider_reference) WHERE provider_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id), type text NOT NULL, content text, next_follow_up_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY, actor_staff_id uuid REFERENCES staff(id), action text NOT NULL, entity_type text NOT NULL,
  entity_id text NOT NULL, before_data jsonb, after_data jsonb, ip_address inet, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_logs(entity_type,entity_id,created_at DESC);
