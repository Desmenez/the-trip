/**
 * Calculate trip status based on dates and booking count
 * 
 * @param startDate - Trip start date
 * @param endDate - Trip end date
 * @param activeBookingsCount - Number of active (non-cancelled) bookings
 * @param pax - Maximum number of passengers for the trip
 * @param now - Current date (defaults to new Date())
 * @returns Trip status: "UPCOMING" | "SOLD_OUT" | "ON_TRIP" | "COMPLETED" | "CANCELLED"
 */
export function calculateTripStatus(
  startDate: Date | string,
  endDate: Date | string,
  activeBookingsCount: number,
  pax: number,
  now: Date = new Date()
): "UPCOMING" | "SOLD_OUT" | "ON_TRIP" | "COMPLETED" | "CANCELLED" {
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Check if trip has started (startDate <= now)
  if (startDateObj <= now) {
    // Cancelled: When the start date has been reached but the trip have no any bookings
    // This status persists even after endDate passes
    if (activeBookingsCount === 0) {
      return "CANCELLED";
    }
    // Trip has bookings
    else {
      // Completed: When the end date has been passed and there are bookings
      if (endDateObj < now) {
        return "COMPLETED";
      }
      // On trip: When the trip is ongoing (startDate <= now <= endDate) and there are bookings
      else {
        return "ON_TRIP";
      }
    }
  }
  // Start date has not been reached (startDate > now)
  else {
    // Sold out: When the start date has not been reached but the trip have been fully booked
    if (activeBookingsCount >= pax) {
      return "SOLD_OUT";
    } else {
      // Upcoming: When the start date has not been reached
      return "UPCOMING";
    }
  }
}
