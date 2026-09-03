const CAMPAIGN_SESSION_KEY = "happygo_utm_campaign";

export function marketingBookingSource() {
  if (typeof window === "undefined") return "website";
  try {
    const params = new URLSearchParams(window.location.search);
    const campaign = String(params.get("utm_campaign") || params.get("campaign") || "").trim().slice(0, 180);
    if (campaign) {
      sessionStorage.setItem(CAMPAIGN_SESSION_KEY, campaign);
      return campaign;
    }
    const stored = String(sessionStorage.getItem(CAMPAIGN_SESSION_KEY) || "").trim();
    if (stored) return stored;
  } catch {}
  return "website";
}
