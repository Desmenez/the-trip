// Lead status change validation rules
import { LeadStatus } from "@prisma/client";
import { isSystemLeadStatus, isManualLeadStatus } from "./lead";

export interface StatusChangeResult {
  allowed: boolean;
  warning?: string;
  requiresReason?: boolean;
  autoChange?: boolean;
}

// Status order for validation (manual states only)
const STATUS_ORDER: Record<string, number> = {
  NEW: 0,
  CONTACTED: 1,
  QUOTED: 2,
  NEGOTIATING: 3,
  CLOSED_WON: 4,
  CLOSED_LOST: 4, // Same level as CLOSED_WON
  ABANDONED: 4, // Same level as closed statuses
};

/**
 * Check if status change is allowed and return validation result
 */
export function validateStatusChange(
  currentStatus: LeadStatus | string,
  newStatus: LeadStatus | string,
  hasActiveBookings: boolean = false
): StatusChangeResult {
  // Same status - always allowed
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  const current = currentStatus as LeadStatus;
  const next = newStatus as LeadStatus;

  // Prevent manual changes to system-managed statuses if has active bookings
  if (hasActiveBookings && isSystemLeadStatus(next)) {
    return {
      allowed: false,
      warning: "Cannot manually change to this status when there are active bookings. Status is managed automatically by the system.",
    };
  }

  // Prevent changing FROM system-managed statuses if has active bookings
  if (hasActiveBookings && isSystemLeadStatus(current)) {
    return {
      allowed: false,
      warning: "Cannot change status when there are active bookings. Cancel all bookings first.",
    };
  }

  // Check if statuses are valid
  if (STATUS_ORDER[current] === undefined || STATUS_ORDER[next] === undefined) {
    return { allowed: false };
  }

  const currentOrder = STATUS_ORDER[current];
  const nextOrder = STATUS_ORDER[next];

  // Moving forward normally (next step)
  if (nextOrder === currentOrder + 1) {
    return { allowed: true };
  }

  // Moving forward but skipping steps
  if (nextOrder > currentOrder + 1 && isManualLeadStatus(next)) {
    return {
      allowed: true,
      warning: "คุณกำลังข้ามขั้นตอน กรุณาระบุเหตุผล",
      requiresReason: true,
    };
  }

  // Moving backward (reverting) - only for manual statuses
  if (nextOrder < currentOrder && isManualLeadStatus(next)) {
    return {
      allowed: true,
      warning: "คุณกำลังย้อน status กลับไป คุณแน่ใจหรือไม่?",
      requiresReason: true,
    };
  }

  // Moving to CLOSED_LOST from any status
  if (next === "CLOSED_LOST") {
    return {
      allowed: true,
      warning: "คุณกำลังปิด lead แบบ Lost กรุณาระบุเหตุผล",
      requiresReason: true,
    };
  }

  // Moving to CLOSED_WON - should be automatic via booking
  if (next === "CLOSED_WON") {
    return {
      allowed: true,
      warning: "Normally, CLOSED_WON is set automatically when a booking is created. Are you sure you want to set this manually?",
      requiresReason: true,
    };
  }

  // Moving to ABANDONED - should be automatic
  if (next === "ABANDONED") {
    return {
      allowed: false,
      warning: "ABANDONED status is set automatically by the system for leads with no activity > 30 days.",
    };
  }

  return { allowed: true };
}

/**
 * Get status change description for UI
 */
export function getStatusChangeDescription(
  currentStatus: LeadStatus | string,
  newStatus: LeadStatus | string
): string {
  const descriptions: Record<string, string> = {
    "NEW → CONTACTED": "ติดต่อลูกค้าแล้ว",
    "CONTACTED → QUOTED": "ส่งใบเสนอราคาให้ลูกค้า",
    "QUOTED → NEGOTIATING": "เจรจากับลูกค้า",
    "NEGOTIATING → CLOSED_WON": "ปิดการขายสำเร็จ",
    "NEGOTIATING → CLOSED_LOST": "ปิด lead แบบไม่สำเร็จ",
    "QUOTED → CLOSED_WON": "ปิดการขายสำเร็จ",
    "QUOTED → CLOSED_LOST": "ปิด lead แบบไม่สำเร็จ",
    "NEW → QUOTED": "ส่งใบเสนอราคาโดยตรง",
    "CONTACTED → NEGOTIATING": "เข้าสู่การเจรจา",
  };

  const key = `${currentStatus} → ${newStatus}`;
  return descriptions[key] || `เปลี่ยน status จาก ${currentStatus} เป็น ${newStatus}`;
}
