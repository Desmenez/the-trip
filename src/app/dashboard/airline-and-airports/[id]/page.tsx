"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plane, Calendar } from "lucide-react";
import Link from "next/link";
import { useAirlineAndAirport } from "@/app/dashboard/airline-and-airports/hooks/use-airline-and-airports";
import { Loading } from "@/components/page/loading";
import { format } from "date-fns";

export default function AirlineAndAirportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: airlineAndAirport, isLoading, error } = useAirlineAndAirport(id);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !airlineAndAirport) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load airline/airport. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/airline-and-airports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg font-mono">
                {airlineAndAirport.code}
              </Badge>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{airlineAndAirport.name}</h2>
          </div>
        </div>
        {/* <Link href={`/dashboard/airline-and-airports/${airlineAndAirport.id}/edit`}>
          <Button>Edit</Button>
        </Link> */}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">IATA code</p>
                <p className="font-mono text-lg font-medium">{airlineAndAirport.code}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Airport name</p>
                <p className="text-lg font-medium">{airlineAndAirport.name}</p>
              </div>
              {airlineAndAirport._count && (
                <div>
                  <p className="text-muted-foreground text-sm">Used in Trips</p>
                  <p className="text-lg font-medium">
                    {airlineAndAirport._count.trips} {airlineAndAirport._count.trips === 1 ? "trip" : "trips"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">Created At</p>
                <p className="text-sm">
                  {format(new Date(airlineAndAirport.createdAt), "PPp")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Updated At</p>
                <p className="text-sm">
                  {format(new Date(airlineAndAirport.updatedAt), "PPp")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
