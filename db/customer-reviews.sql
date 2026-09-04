-- Verified customer reviews. Only completed customers may write through /api/reviews.
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_slug text NOT NULL,
  product_name_snapshot text NOT NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_account_id uuid REFERENCES customer_accounts(id) ON DELETE SET NULL,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 10),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','hidden')),
  verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_slug, customer_id)
);
CREATE INDEX IF NOT EXISTS customer_reviews_product_idx ON customer_reviews(product_slug,status,created_at DESC);
CREATE INDEX IF NOT EXISTS customer_reviews_customer_idx ON customer_reviews(customer_id,created_at DESC);
