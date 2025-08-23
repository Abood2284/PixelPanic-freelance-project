import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconMapPin,
  IconClock,
  IconTools,
  IconArrowRight,
} from "@tabler/icons-react";

interface GigCardProps {
  gig: {
    id: number;
    status: string;
    timeSlot: string | null;
    address?: {
      fullName: string;
      flatAndStreet: string;
      pincode: string | null;
    };
    orderItems: Array<{ issueName: string; modelName: string }>;
  };
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "Confirmed";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
};

export function GigCard({ gig }: GigCardProps) {
  const primaryItem = gig.orderItems[0];

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              #{gig.id}
            </span>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${getStatusColor(gig.status)}`}
            >
              {getStatusLabel(gig.status)}
            </Badge>
          </div>
          {gig.timeSlot && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconClock className="h-3 w-3" />
              <span>{gig.timeSlot}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Device & Issue */}
        <div className="flex items-start gap-2">
          <IconTools className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {primaryItem?.modelName}
            </p>
            <p className="text-xs text-muted-foreground">
              {primaryItem?.issueName}
            </p>
          </div>
        </div>

        {/* Address */}
        {gig.address && (
          <div className="flex items-start gap-2">
            <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {gig.address.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {gig.address.flatAndStreet}
                {gig.address.pincode && `, ${gig.address.pincode}`}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button asChild className="w-full" size="sm">
            <a href={`/technician/${gig.id}`}>
              Open Gig
              <IconArrowRight className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
