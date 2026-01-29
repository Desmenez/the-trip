// Trip status type - synced with calculateTripStatus return type
export type TripStatus = "UPCOMING" | "SOLD_OUT" | "ON_TRIP" | "COMPLETED" | "CANCELLED";

// Trip status display labels mapping
export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  UPCOMING: "Upcoming",
  SOLD_OUT: "Sold out",
  ON_TRIP: "On trip",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Trip status badge variant mapping
export const TRIP_STATUS_VARIANTS: Record<TripStatus, "default" | "secondary" | "destructive" | "success" | "info" | "warning" | "violet"> = {
  UPCOMING: "info",
  SOLD_OUT: "warning",
  ON_TRIP: "violet",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

// Helper function to get trip status label
export function getTripStatusLabel(status: string): string {
  return TRIP_STATUS_LABELS[status as TripStatus] || status;
}

// Helper function to get trip status badge variant
export function getTripStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "info" | "warning" | "violet" {
  return TRIP_STATUS_VARIANTS[status as TripStatus] || "default";
}
