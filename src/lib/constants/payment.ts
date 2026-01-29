import { PaymentStatus } from "@prisma/client";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  DEPOSIT_PENDING: "Deposit pending",
  DEPOSIT_PAID: "Deposit paid",
  FULLY_PAID: "Fully paid",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, "default" | "secondary" | "destructive" | "success" | "info" | "warning"> = {
  FULLY_PAID: "success",
  DEPOSIT_PAID: "warning",
  DEPOSIT_PENDING: "info",
  CANCELLED: "destructive",
};

export function getPaymentStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "info" | "warning" {
  return PAYMENT_STATUS_VARIANTS[status as PaymentStatus] || "default";
}