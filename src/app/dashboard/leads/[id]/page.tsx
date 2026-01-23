"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  XCircle,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLead } from "../hooks/use-leads";
import { LeadForm } from "../_components/lead-form";
import { format } from "date-fns";
import { formatDecimal, cn } from "@/lib/utils";
import Link from "next/link";
import { Loading } from "@/components/page/loading";

const LEAD_STATUSES = [
  { value: "INTERESTED", label: "Interested", icon: Circle },
  { value: "BOOKED", label: "Booked", icon: CheckCircle2 },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle },
] as const;

const getStatusIndex = (status: string): number => {
  return LEAD_STATUSES.findIndex((s) => s.value === status);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "INTERESTED":
      return "bg-blue-500";
    case "BOOKED":
      return "bg-green-500";
    case "COMPLETED":
      return "bg-emerald-500";
    case "CANCELLED":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function LeadViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: leadId } = use(params);
  const { data: lead, isLoading, error } = useLead(leadId);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !lead) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load lead.</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(lead.status);

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Lead</h2>
        </div>
      </div>

      {/* Lead Form */}
      <div className="bg-card rounded-md border p-6">
        <LeadForm
          mode="view"
          initialData={lead}
        />
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
          <CardDescription>Current progress in the sales pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {LEAD_STATUSES.map((status, index) => {
              const StatusIcon = status.icon;
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === LEAD_STATUSES.length - 1;
              const isCancelled = lead.status === "CANCELLED";

              // Determine colors based on status
              let iconBgColor = "bg-muted text-muted-foreground";
              let lineColor = "bg-muted";

              if (isActive) {
                if (isCurrent) {
                  // Current status
                  if (isCancelled) {
                    iconBgColor = "bg-red-500 text-white";
                  } else {
                    iconBgColor = "bg-primary text-primary-foreground";
                  }
                } else {
                  // Past status - always green (completed)
                  iconBgColor = "bg-green-500 text-white";
                }
              }

              // Line color logic
              if (index < currentStatusIndex) {
                // If the next status is CANCELLED, make the line red
                if (isCancelled && index === currentStatusIndex - 1) {
                  lineColor = "bg-red-500";
                } else {
                  lineColor = "bg-green-500";
                }
              }

              return (
                <div key={status.value} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn("rounded-full p-3 transition-colors", iconBgColor)}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-center text-xs font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  {!isLast && <div className={cn("mx-2 -mt-8 h-1 flex-1 transition-colors", lineColor)} />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bookings */}
      {lead.bookings && lead.bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Related Bookings
            </CardTitle>
            <CardDescription>
              {lead.bookings.length} {lead.bookings.length === 1 ? "booking" : "bookings"} associated with this lead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lead.bookings.map((booking) => (
                <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                  <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <h4 className="font-semibold">{booking.trip.name}</h4>
                          </div>
                          <p className="text-muted-foreground text-sm">{booking.trip.destination}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="text-muted-foreground h-4 w-4" />
                              <span>
                                {format(new Date(booking.trip.startDate), "dd MMM yyyy")} -{" "}
                                {format(new Date(booking.trip.endDate), "dd MMM yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 pt-2">
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            <Badge variant="outline">{booking.visaStatus.replace("_", " ")}</Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-muted-foreground text-sm font-medium">Total</p>
                          <p className="text-lg font-semibold">{formatDecimal(booking.totalAmount)}</p>
                          <p className="text-muted-foreground text-sm">Paid: {formatDecimal(booking.paidAmount)}</p>
                          {booking.paidAmount < booking.totalAmount && (
                            <p className="text-sm text-yellow-600">
                              Remaining: {formatDecimal(booking.totalAmount - booking.paidAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
