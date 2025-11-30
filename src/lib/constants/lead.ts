// Lead enum values - synced with prisma/schema.prisma
// Update this file when LeadStatus or LeadSource enum changes in schema

// LeadStatus enum values (must match prisma/schema.prisma)
export const LEAD_STATUS_VALUES = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "NEGOTIATING",
  "CLOSED_WON",
  "CLOSED_LOST",
  "ABANDONED",
] as const;

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

// LeadStatus display labels mapping
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  NEGOTIATING: "Negotiating",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
  ABANDONED: "Abandoned",
};

// Manual Lead Statuses (Agent can control)
export const MANUAL_LEAD_STATUSES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATING"] as const;

// System Lead Statuses (System manages automatically)
export const SYSTEM_LEAD_STATUSES = ["CLOSED_WON", "CLOSED_LOST", "ABANDONED"] as const;

// Helper function to get lead status label
export function getLeadStatusLabel(status: string): string {
  return LEAD_STATUS_LABELS[status as LeadStatus] || status.replace("_", " ");
}

// Helper function to check if status is manual
export function isManualLeadStatus(status: string): boolean {
  return MANUAL_LEAD_STATUSES.includes(status as any);
}

// Helper function to check if status is system-managed
export function isSystemLeadStatus(status: string): boolean {
  return SYSTEM_LEAD_STATUSES.includes(status as any);
}

// LeadSource enum values (must match prisma/schema.prisma)
export const LEAD_SOURCE_VALUES = ["WEBSITE", "WALKIN", "REFERRAL", "SOCIAL", "LINE", "OTHER"] as const;

export type LeadSource = (typeof LEAD_SOURCE_VALUES)[number];

// LeadSource display labels mapping
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Website",
  WALKIN: "Walk-in",
  REFERRAL: "Referral",
  SOCIAL: "Social Media",
  LINE: "LINE",
  OTHER: "Other",
};

// Helper function to get lead source label
export function getLeadSourceLabel(source: string): string {
  return LEAD_SOURCE_LABELS[source as LeadSource] || source;
}
