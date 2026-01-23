import { PaymentStatus } from "@prisma/client";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  DEPOSIT_PENDING: "Deposit pending",
  DEPOSIT_PAID: "Deposit paid",
  FULLY_PAID: "Fully paid",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  FULLY_PAID: "bg-green-500",
  DEPOSIT_PAID: "bg-blue-500",
  DEPOSIT_PENDING: "bg-yellow-500",
  CANCELLED: "bg-red-500",
};

export function getPaymentStatusColor(status: string): string {
  return PAYMENT_STATUS_COLORS[status as PaymentStatus] || "bg-gray-500";
}