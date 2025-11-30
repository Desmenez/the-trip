// Commission enum values - synced with prisma/schema.prisma
// Update this file when CommissionStatus or CommissionType enum changes in schema

// CommissionStatus enum values (must match prisma/schema.prisma)
export const COMMISSION_STATUS_VALUES = ["PENDING", "APPROVED", "PAID"] as const;

export type CommissionStatus = (typeof COMMISSION_STATUS_VALUES)[number];

// CommissionStatus display labels mapping
export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
};

// Helper function to get commission status label
export function getCommissionStatusLabel(status: string): string {
  return COMMISSION_STATUS_LABELS[status as CommissionStatus] || status;
}

// CommissionType enum values (must match prisma/schema.prisma)
export const COMMISSION_TYPE_VALUES = ["SALES", "SERVICE", "WALKIN"] as const;

export type CommissionType = (typeof COMMISSION_TYPE_VALUES)[number];

// CommissionType display labels mapping
export const COMMISSION_TYPE_LABELS: Record<CommissionType, string> = {
  SALES: "Sales Commission",
  SERVICE: "Service Commission",
  WALKIN: "Walk-in Commission",
};

// Helper function to get commission type label
export function getCommissionTypeLabel(type: string): string {
  return COMMISSION_TYPE_LABELS[type as CommissionType] || type;
}

// Commission status color mapping
export const COMMISSION_STATUS_COLORS: Record<CommissionStatus, string> = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-blue-500",
  PAID: "bg-green-500",
};

// Helper function to get commission status color
export function getCommissionStatusColor(status: string): string {
  return COMMISSION_STATUS_COLORS[status as CommissionStatus] || "bg-gray-500";
}
