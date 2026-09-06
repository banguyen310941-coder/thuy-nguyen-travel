-- HappyGo Travel production schema extension
-- Snapshot aligned with Neon production on 2026-09-06.
-- Apply AFTER db/schema.sql when bootstrapping a fresh database.
-- Statements are additive / idempotent where PostgreSQL supports it.

-- Columns added to the original payment model.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_by_staff_id uuid REFERENCES staff(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS partner_accounts (
  partner_id uuid PRIMARY KEY REFERENCES partners(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  contact_name text,
  website text,
  tax_code text,
  address text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'Khác',
  status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','processing','waiting','resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_support_tickets_partner_idx ON partner_support_tickets(partner_id,updated_at DESC);

CREATE TABLE IF NOT EXISTS partner_support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES partner_support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK(sender_type IN ('partner','admin')),
  sender_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_support_messages_ticket_idx ON partner_support_messages(ticket_id,created_at);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bank_name text,
  account_number text,
  account_name text,
  phone text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  supplier_id uuid REFERENCES suppliers(id),
  supplier_name_snapshot text NOT NULL,
  bank_name_snapshot text,
  account_number_snapshot text,
  account_name_snapshot text,
  customer_paid_amount_vnd bigint NOT NULL DEFAULT 0,
  amount_vnd bigint NOT NULL CHECK(amount_vnd>0),
  purpose text NOT NULL,
  due_date date,
  note text,
  status text NOT NULL DEFAULT 'pending_director',
  created_by_staff_id uuid NOT NULL REFERENCES staff(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  director_by_staff_id uuid REFERENCES staff(id),
  director_at timestamptz,
  director_note text,
  paid_by_staff_id uuid REFERENCES staff(id),
  paid_at timestamptz,
  paid_amount_vnd bigint,
  payment_method text,
  transaction_ref text,
  accounting_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_requests_booking ON payment_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_creator ON payment_requests(created_by_staff_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status,created_at DESC);

CREATE TABLE IF NOT EXISTS payment_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES payment_requests(id) ON DELETE CASCADE,
  actor_staff_id uuid REFERENCES staff(id),
  action text NOT NULL,
  from_status text,
  to_status text,
  detail text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_request_events_request ON payment_request_events(request_id,created_at);

CREATE TABLE IF NOT EXISTS accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no text NOT NULL UNIQUE,
  entry_type text NOT NULL CHECK(entry_type IN ('income','expense')),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  description text NOT NULL,
  counterparty text,
  fund text NOT NULL DEFAULT 'bank' CHECK(fund IN ('cash','bank','wallet')),
  amount_vnd bigint NOT NULL CHECK(amount_vnd>0),
  document_ref text,
  note text,
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  created_by_staff_id uuid REFERENCES staff(id),
  voided_at timestamptz,
  voided_by_staff_id uuid REFERENCES staff(id),
  void_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_date ON accounting_entries(entry_date DESC,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_accounting_entries_source ON accounting_entries(source,source_id);

CREATE TABLE IF NOT EXISTS accounting_balances (
  id smallint PRIMARY KEY DEFAULT 1 CHECK(id=1),
  cash_vnd bigint NOT NULL DEFAULT 0,
  bank_vnd bigint NOT NULL DEFAULT 0,
  wallet_vnd bigint NOT NULL DEFAULT 0,
  updated_by_staff_id uuid REFERENCES staff(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO accounting_balances(id) VALUES(1) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','blocked')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_customer ON customer_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_email_lower ON customer_accounts(lower(email));

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_slug text NOT NULL,
  product_name_snapshot text NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_account_id uuid REFERENCES customer_accounts(id) ON DELETE SET NULL,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK(rating>=1 AND rating<=10),
  comment text NOT NULL CHECK(char_length(comment)>=10 AND char_length(comment)<=2000),
  status text NOT NULL DEFAULT 'published' CHECK(status IN ('published','hidden')),
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_slug,customer_id)
);
CREATE INDEX IF NOT EXISTS customer_reviews_customer_idx ON customer_reviews(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS customer_reviews_product_idx ON customer_reviews(product_slug,status,created_at DESC);

COMMENT ON COLUMN affiliates.commission_rate IS 'Legacy compatibility only. Active CTV commission is calculated automatically from successful-order tiers (35/40/45/50 percent) on booking profit.';
