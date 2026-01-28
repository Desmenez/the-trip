import { PrismaClient } from "@prisma/client";

export async function seedAirlineAndAirports(prisma: PrismaClient) {
  // Common airlines and airports (IATA codes)
  const airlineAndAirports = [
    // Airlines
    { code: "TG", name: "Thai Airways International" },
    { code: "BKK", name: "Suvarnabhumi Airport" },
    { code: "DMK", name: "Don Mueang International Airport" },
    { code: "SQ", name: "Singapore Airlines" },
    { code: "CX", name: "Cathay Pacific Airways" },
    { code: "JL", name: "Japan Airlines" },
    { code: "NH", name: "All Nippon Airways" },
    { code: "KE", name: "Korean Air" },
    { code: "OZ", name: "Asiana Airlines" },
    { code: "CI", name: "China Airlines" },
    { code: "BR", name: "EVA Air" },
    { code: "CA", name: "Air China" },
    { code: "MU", name: "China Eastern Airlines" },
    { code: "CZ", name: "China Southern Airlines" },
    { code: "QF", name: "Qantas Airways" },
    { code: "EK", name: "Emirates" },
    { code: "QR", name: "Qatar Airways" },
    { code: "EY", name: "Etihad Airways" },
    { code: "TK", name: "Turkish Airlines" },
    { code: "LH", name: "Lufthansa" },
    { code: "AF", name: "Air France" },
    { code: "KL", name: "KLM Royal Dutch Airlines" },
    { code: "BA", name: "British Airways" },
    { code: "AA", name: "American Airlines" },
    { code: "UA", name: "United Airlines" },
    { code: "DL", name: "Delta Air Lines" },
    // Major Airports
    { code: "SIN", name: "Singapore Changi Airport" },
    { code: "HKG", name: "Hong Kong International Airport" },
    { code: "NRT", name: "Narita International Airport" },
    { code: "HND", name: "Haneda Airport" },
    { code: "ICN", name: "Incheon International Airport" },
    { code: "TPE", name: "Taiwan Taoyuan International Airport" },
    { code: "PEK", name: "Beijing Capital International Airport" },
    { code: "PVG", name: "Shanghai Pudong International Airport" },
    { code: "CAN", name: "Guangzhou Baiyun International Airport" },
    { code: "SYD", name: "Sydney Kingsford Smith Airport" },
    { code: "MEL", name: "Melbourne Airport" },
    { code: "DXB", name: "Dubai International Airport" },
    { code: "DOH", name: "Hamad International Airport" },
    { code: "AUH", name: "Abu Dhabi International Airport" },
    { code: "IST", name: "Istanbul Airport" },
    { code: "FRA", name: "Frankfurt Airport" },
    { code: "CDG", name: "Charles de Gaulle Airport" },
    { code: "AMS", name: "Amsterdam Airport Schiphol" },
    { code: "LHR", name: "London Heathrow Airport" },
    { code: "JFK", name: "John F. Kennedy International Airport" },
    { code: "LAX", name: "Los Angeles International Airport" },
    { code: "SFO", name: "San Francisco International Airport" },
  ];

  const created = [];
  for (const item of airlineAndAirports) {
    try {
      const airlineAndAirport = await prisma.airlineAndAirport.create({
        data: {
          code: item.code,
          name: item.name,
        },
      });
      created.push(airlineAndAirport);
    } catch (error) {
      // Skip if code already exists
      console.warn(`⚠️  Skipped ${item.code} (${item.name}): already exists`);
    }
  }

  console.log(`✅ Seeded ${created.length} airlines and airports`);
  return created;
}
