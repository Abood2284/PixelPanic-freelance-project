import Link from "next/link";
import { redirect } from "next/navigation";
import { requireTechnician } from "@/lib/auth-middleware";
import { getMockGigDetails } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { StatusControls } from "@/components/technician/status-controls";
import { CompleteForm } from "@/components/technician/complete-form";
import { NotesWrapper } from "@/components/technician/notes-wrapper";

export default async function TechnicianGigDetailPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  const { gigId } = await params;

  // Use the new auth middleware - supports both dev and production modes
  const auth = await requireTechnician("/");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

  // Get token for API calls - auth middleware handles both dev and production
  const token = auth?.isDev ? "dev-token" : undefined;

  const id = Number(gigId);
  if (!Number.isInteger(id)) redirect("/technician");

  let gig: GigDetail;
  let errorText: string | null = null;

  // Use mock data in development mode
  if (auth?.isDev) {
    gig = getMockGigDetails(id) as GigDetail;
  } else {
    // Production API call
    const gigRes = await fetch(`${apiBase}/api/technicians/gigs/${id}`, {
      headers: { Cookie: `auth_token=${token}` },
      cache: "no-store",
    });

    if (!gigRes.ok) {
      try {
        const t = await gigRes.text();
        errorText = t || `Request failed with status ${gigRes.status}`;
      } catch {
        errorText = `Request failed with status ${gigRes.status}`;
      }
      redirect("/technician");
    }

    const data = (await gigRes.json()) as { gig: GigDetail };
    gig = data.gig;
  }

  const fullAddress = [gig.address?.flatAndStreet, gig.address?.pincode]
    .filter(Boolean)
    .join(", ");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground">Gig #{gig.id}</div>
          <h1 className="text-xl font-bold truncate">
            {gig.orderItems[0]?.modelName} — {gig.orderItems[0]?.issueName}
          </h1>
        </div>
        <Link
          href="/technician"
          className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back
        </Link>
      </div>

      {/* Error Display */}
      {errorText && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-700">{errorText}</p>
        </div>
      )}

      {/* Status & Time Section */}
      <section className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">Status</div>
          <StatusBadge status={gig.status} />
        </div>
        {gig.timeSlot && (
          <div className="text-sm text-gray-600">
            <span className="text-muted-foreground">Time window:</span>{" "}
            {gig.timeSlot}
          </div>
        )}
      </section>

      {/* Customer Information */}
      <section className="bg-white rounded-lg border p-4 space-y-3">
        <div className="font-semibold text-gray-900">Customer Information</div>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Name:</span>{" "}
            {gig.address?.fullName}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Phone:</span>{" "}
            <a
              href={`tel:${gig.address?.phone}`}
              className="text-blue-600 hover:underline"
            >
              {gig.address?.phone}
            </a>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-600">{fullAddress}</span>
          </div>
        </div>
        <div className="pt-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center"
          >
            <Button size="sm" className="w-full sm:w-auto">
              📍 Open in Maps
            </Button>
          </a>
        </div>
      </section>

      {/* Device & Issue */}
      <section className="bg-white rounded-lg border p-4 space-y-3">
        <div className="font-semibold text-gray-900">Device & Issue</div>
        <div className="space-y-2">
          {gig.orderItems.map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium text-sm">{item.modelName}</div>
              <div className="text-sm text-gray-600">{item.issueName}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions Section */}
      <ClientActions
        apiBase={apiBase}
        gigId={gig.id}
        initialStatus={gig.status}
        isDev={auth?.isDev}
      />

      {/* Notes Section */}
      <NotesWrapper gigId={gig.id} initialNotes={gig.notes || ""} />

      {/* Photos Section */}
      {gig.photos && gig.photos.length > 0 && (
        <section className="bg-white rounded-lg border p-4 space-y-3">
          <div className="font-semibold text-gray-900">Job Photos</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gig.photos.map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt="Job photo"
                className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: GigDetail["status"] }) {
  const getStatusConfig = (status: GigDetail["status"]) => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
        };
      case "in_progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "🔧",
        };
      case "completed":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: "✅",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "❌",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📋",
        };
    }
  };

  const config = getStatusConfig(status);
  const label = status
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1`}
    >
      <span>{config.icon}</span>
      <span>{label}</span>
    </span>
  );
}

function ClientActions({
  apiBase,
  gigId,
  initialStatus,
  isDev,
}: {
  apiBase: string;
  gigId: number;
  initialStatus: GigDetail["status"];
  isDev?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      <div className="font-semibold text-gray-900">Actions</div>
      <StatusControls apiBase={apiBase} gigId={gigId} status={initialStatus} />
      {/* Completion controls */}
      <CompleteSection apiBase={apiBase} gigId={gigId} isDev={isDev} />
    </div>
  );
}

function CompleteSection({
  apiBase,
  gigId,
  isDev,
}: {
  apiBase: string;
  gigId: number;
  isDev?: boolean;
}) {
  return <CompleteForm apiBase={apiBase} gigId={gigId} />;
}

interface GigDetail {
  id: number;
  status:
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "pending_payment";
  timeSlot: string | null;
  address?: {
    fullName: string;
    phone: string;
    flatAndStreet: string;
    pincode: string;
  };
  orderItems: Array<{
    issueName: string;
    modelName: string;
    price: number;
    parts: string[];
  }>;
  photos: Array<{ id: number; url: string }> | [];
  notes?: string;
}
