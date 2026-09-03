export type FunnelProposal = {
  id: string;
  campaign: string;
  month: string;
  channel: string;
  status: string;
};

export type FunnelExpense = {
  campaign: string;
  month: string;
  date: string;
  category: string;
  channel: string;
  amount: number;
};

export type FunnelCustomer = {
  phone?: string | null;
  email?: string | null;
  source?: string;
  campaign?: string;
  marketingCampaign?: string;
  createdAt?: string;
};

export type FunnelBooking = {
  id: number;
  phone?: string | null;
  email?: string | null;
  source?: string;
  campaign?: string;
  marketingCampaign?: string;
  utm_campaign?: string;
  status?: string;
  created_at?: string;
  salesStaffId?: string;
  salesStaffName?: string;
};

export type FunnelHistory = {
  customerKey: string;
  createdAt?: string;
};

export type FunnelReceipt = {
  bookingId: number;
  amount: number;
};

export type FunnelAssignment = {
  staffId: string;
  staffName: string;
  assignedAt?: string;
};

export type FunnelStaff = {
  id: string;
  name: string;
  status?: string;
};

export type FunnelAvailability = Record<
  string,
  { receivingCustomers: boolean; updatedAt?: string }
>;

export type SaleFunnelRow = {
  staffId: string;
  staffName: string;
  received: number;
  contacted: number;
  contactRate: number;
  deposits: number;
  conversionRate: number;
  receivingCustomers: boolean;
  assessment: "good" | "watch" | "poor" | "insufficient";
  assessmentLabel: string;
};

type Lead = {
  key: string;
  createdAt: string;
  source: string;
  campaign: string;
  staffId: string;
  staffName: string;
  bookingIds: Set<number>;
  contacted: boolean;
  depositOrders: number;
};

export type MarketingFunnelResult = {
  campaigns: string[];
  adSpend: number;
  totalMarketingSpend: number;
  leads: number;
  contacted: number;
  contactRate: number;
  deposits: number;
  conversionRate: number;
  costPerLead: number;
  costPerDeposit: number;
  unattributedLeads: number;
  unassignedLeads: number;
  saleRows: SaleFunnelRow[];
};

export type MarketingFunnelInput = {
  proposals: FunnelProposal[];
  expenses: FunnelExpense[];
  customers: FunnelCustomer[];
  bookings: FunnelBooking[];
  histories: FunnelHistory[];
  receipts: FunnelReceipt[];
  assignments: Record<string, FunnelAssignment>;
  staff: FunnelStaff[];
  availability: FunnelAvailability;
};

function normalize(value?: string | null) {
  return String(value || "").trim().toLocaleLowerCase("vi-VN");
}

function monthOf(value?: string | null) {
  return String(value || "").slice(0, 7);
}

function rate(value: number, total: number) {
  return total ? Math.round((value * 1000) / total) / 10 : 0;
}

function customerKey(phone?: string | null, email?: string | null) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `phone:${digits}` : `email:${normalize(email)}`;
}

function earliest(current: string, candidate?: string) {
  if (!candidate) return current;
  if (!current) return candidate;
  return +new Date(candidate) < +new Date(current) ? candidate : current;
}

function saleAssessment(received: number, contactRate: number, conversionRate: number) {
  if (received < 5) return { assessment: "insufficient" as const, label: "Chưa đủ dữ liệu" };
  if (conversionRate >= 15) {
    return { assessment: "good" as const, label: "Tốt" };
  }
  if (conversionRate < 8 || contactRate < 60) {
    return { assessment: "poor" as const, label: "Kém · cần xem lại" };
  }
  return { assessment: "watch" as const, label: "Cần theo dõi" };
}

export function buildMarketingSalesFunnel(
  input: MarketingFunnelInput,
  month: string,
  selectedCampaign = "all",
): MarketingFunnelResult {
  const monthProposals = input.proposals.filter(
    (item) => item.month === month && item.status === "approved",
  );
  const monthExpenses = input.expenses.filter(
    (item) => (item.month || monthOf(item.date)) === month,
  );
  const campaignMap = new Map<string, string>();
  [...monthProposals, ...monthExpenses].forEach((item) => {
    if (item.campaign.trim()) campaignMap.set(normalize(item.campaign), item.campaign.trim());
  });
  const campaigns = [...campaignMap.values()].sort((a, b) => a.localeCompare(b, "vi"));
  const campaignKeys = new Set(campaignMap.keys());
  const selectedKey = normalize(selectedCampaign);
  const expenseScope = monthExpenses.filter(
    (item) => selectedCampaign === "all" || normalize(item.campaign) === selectedKey,
  );
  const totalMarketingSpend = expenseScope.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const adSpend = expenseScope
    .filter((item) => {
      const category = normalize(item.category);
      const channel = normalize(item.channel);
      return category.includes("quảng cáo") || channel.includes("ads");
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const receiptByBooking = new Map<number, number>();
  input.receipts.forEach((item) => {
    receiptByBooking.set(
      item.bookingId,
      (receiptByBooking.get(item.bookingId) || 0) + Number(item.amount || 0),
    );
  });
  const historyKeys = new Set(input.histories.map((item) => item.customerKey));
  const leads = new Map<string, Lead>();

  const upsert = ({
    key,
    createdAt,
    source,
    campaign,
    booking,
  }: {
    key: string;
    createdAt?: string;
    source?: string;
    campaign?: string;
    booking?: FunnelBooking;
  }) => {
    if (!key || key === "email:") return;
    const assignment = input.assignments[key];
    const existing = leads.get(key);
    const explicitCampaign = campaignMap.get(normalize(campaign || source)) || "";
    const fallbackDate = assignment?.assignedAt || "";
    const next: Lead = existing || {
      key,
      createdAt: "",
      source: "",
      campaign: "",
      staffId: assignment?.staffId || booking?.salesStaffId || "",
      staffName: assignment?.staffName || booking?.salesStaffName || "Chưa phân Sale",
      bookingIds: new Set<number>(),
      contacted: false,
      depositOrders: 0,
    };
    next.createdAt = earliest(next.createdAt, createdAt || fallbackDate);
    if (!next.source && source) next.source = source;
    if (!next.campaign && explicitCampaign) next.campaign = explicitCampaign;
    if (!next.staffId && booking?.salesStaffId) {
      next.staffId = booking.salesStaffId;
      next.staffName = booking.salesStaffName || "Sale phụ trách";
    }
    if (booking) next.bookingIds.add(booking.id);
    leads.set(key, next);
  };

  input.customers.forEach((item) =>
    upsert({
      key: customerKey(item.phone, item.email),
      createdAt: item.createdAt,
      source: item.source,
      campaign: item.marketingCampaign || item.campaign,
    }),
  );
  input.bookings.forEach((item) =>
    upsert({
      key: customerKey(item.phone, item.email),
      createdAt: item.created_at,
      source: item.source,
      campaign: item.marketingCampaign || item.utm_campaign || item.campaign,
      booking: item,
    }),
  );

  const bookingById = new Map(input.bookings.map((item) => [item.id, item]));
  leads.forEach((lead) => {
    const relatedBookings = [...lead.bookingIds]
      .map((id) => bookingById.get(id))
      .filter((item): item is FunnelBooking => Boolean(item));
    lead.depositOrders = relatedBookings.filter(
      (item) => (receiptByBooking.get(item.id) || 0) > 0,
    ).length;
    lead.contacted =
      lead.depositOrders > 0 ||
      historyKeys.has(lead.key) ||
      relatedBookings.some((item) =>
        ["contacting", "confirmed", "completed"].includes(String(item.status || "")),
      );
  });

  const monthLeads = [...leads.values()].filter((lead) => monthOf(lead.createdAt) === month);
  const attributedLeads = monthLeads.filter((lead) => campaignKeys.has(normalize(lead.campaign)));
  const scopedLeads = attributedLeads.filter(
    (lead) => selectedCampaign === "all" || normalize(lead.campaign) === selectedKey,
  );
  const contacted = scopedLeads.filter((lead) => lead.contacted).length;
  const deposits = scopedLeads.reduce((sum, lead) => sum + lead.depositOrders, 0);

  const staffMap = new Map(input.staff.map((item) => [item.id, item]));
  scopedLeads.forEach((lead) => {
    if (lead.staffId && !staffMap.has(lead.staffId)) {
      staffMap.set(lead.staffId, { id: lead.staffId, name: lead.staffName, status: "inactive" });
    }
  });
  const saleRows = [...staffMap.values()]
    .map((person) => {
      const mine = scopedLeads.filter((lead) => lead.staffId === person.id);
      const mineContacted = mine.filter((lead) => lead.contacted).length;
      const mineDeposits = mine.reduce((sum, lead) => sum + lead.depositOrders, 0);
      const contactRate = rate(mineContacted, mine.length);
      const conversionRate = rate(mineDeposits, mine.length);
      const assessment = saleAssessment(mine.length, contactRate, conversionRate);
      return {
        staffId: person.id,
        staffName: person.name,
        received: mine.length,
        contacted: mineContacted,
        contactRate,
        deposits: mineDeposits,
        conversionRate,
        receivingCustomers: input.availability[person.id]?.receivingCustomers !== false,
        assessment: assessment.assessment,
        assessmentLabel: assessment.label,
      } satisfies SaleFunnelRow;
    })
    .filter((row) => row.received > 0 || input.staff.some((item) => item.id === row.staffId))
    .sort((a, b) => b.conversionRate - a.conversionRate || b.received - a.received);

  return {
    campaigns,
    adSpend,
    totalMarketingSpend,
    leads: scopedLeads.length,
    contacted,
    contactRate: rate(contacted, scopedLeads.length),
    deposits,
    conversionRate: rate(deposits, scopedLeads.length),
    costPerLead: scopedLeads.length ? Math.round(adSpend / scopedLeads.length) : 0,
    costPerDeposit: deposits ? Math.round(adSpend / deposits) : 0,
    unattributedLeads: monthLeads.length - attributedLeads.length,
    unassignedLeads: scopedLeads.filter((lead) => !lead.staffId).length,
    saleRows,
  };
}
