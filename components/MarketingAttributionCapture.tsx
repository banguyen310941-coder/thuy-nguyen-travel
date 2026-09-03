"use client";

import { useEffect } from "react";
import { marketingBookingSource } from "@/lib/marketing-attribution";

export function MarketingAttributionCapture() {
  useEffect(() => { marketingBookingSource(); }, []);
  return null;
}
