-- Push subscriptions for HappyGo Admin PWA. VAPID signing key is derived server-side from existing auth secret.
CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  enabled boolean NOT NULL DEFAULT true,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_push_subscriptions_staff_idx ON admin_push_subscriptions(staff_id,enabled,updated_at DESC);
