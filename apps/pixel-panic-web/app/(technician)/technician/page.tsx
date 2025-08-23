import { requireTechnician } from "@/lib/auth-middleware";
import { GigCard } from "@/components/technician/gig-card";
import { mockTechnicianGigs } from "@/lib/mock-data";

export default async function TechnicianHomePage() {
  // Use the new auth middleware - supports both dev and production modes
  const auth = await requireTechnician("/");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;

  // Get token for API calls - auth middleware handles both dev and production
  const token = auth?.isDev ? "dev-token" : undefined; // TODO: Handle dev token properly

  let errorText: string | null = null;
  let data: {
    gigs: Array<{
      id: number;
      status: string;
      timeSlot: string | null;
      address?: {
        fullName: string;
        flatAndStreet: string;
        pincode: string | null;
      };
      orderItems: Array<{ issueName: string; modelName: string }>;
    }>;
  } = { gigs: [] };

  // Use mock data in development mode
  if (auth?.isDev) {
    data = { gigs: mockTechnicianGigs };
  } else {
    // Production API call
    const gigsRes = await fetch(
      `${apiBase}/api/technicians/me/gigs?status=active`,
      {
        headers: { Cookie: `auth_token=${token}` },
        cache: "no-store",
      }
    );

    if (gigsRes.ok) {
      data = (await gigsRes.json()) as typeof data;
    } else {
      try {
        const t = await gigsRes.text();
        errorText = t || `Request failed with status ${gigsRes.status}`;
      } catch {
        errorText = `Request failed with status ${gigsRes.status}`;
      }
    }
  }

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Today's Gigs</h1>
        <div className="text-sm text-muted-foreground">
          {data.gigs.length} {data.gigs.length === 1 ? "gig" : "gigs"}
        </div>
      </div>

      {errorText && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errorText}</p>
        </div>
      )}

      {data.gigs.length === 0 && !errorText && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-1">
            No active gigs yet
          </h3>
          <p className="text-sm text-muted-foreground">
            You'll see today's assigned repairs here when they're available.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {data.gigs.map((gig) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </div>
    </main>
  );
}
