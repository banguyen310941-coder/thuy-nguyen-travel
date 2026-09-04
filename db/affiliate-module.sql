-- HappyGo Travel - Affiliate / CTV module
-- Apply to Neon production after review. Money is integer VND.

ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE staff ADD CONSTRAINT staff_role_check
  CHECK (role IN ('owner','admin','sales','content','operations','accounting','affiliate'));

CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES staff(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE,
  phone text,
  zalo text,
  bank_account text,
  bank_name text,
  account_holder text,
  total_commission bigint NOT NULL DEFAULT 0 CHECK (total_commission >= 0),
  balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
  commission_rate numeric(5,2) NOT NULL DEFAULT 5.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  villa_id uuid REFERENCES products(id) ON DELETE SET NULL,
  customer_phone text,
  commission_amount bigint NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','cancelled')),
  credited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount bigint NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  payout_date timestamptz,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Needed for the click KPI on the CTV dashboard.
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  villa_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  visitor_key text NOT NULL,
  clicked_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(affiliate_id,villa_id,visitor_key,clicked_on)
);

CREATE INDEX IF NOT EXISTS affiliate_referrals_affiliate_idx ON affiliate_referrals(affiliate_id,created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_referrals_status_idx ON affiliate_referrals(status,created_at DESC);
CREATE INDEX IF NOT EXISTS commission_payouts_affiliate_idx ON commission_payouts(affiliate_id,created_at DESC);
CREATE INDEX IF NOT EXISTS affiliate_clicks_affiliate_idx ON affiliate_clicks(affiliate_id,created_at DESC);
