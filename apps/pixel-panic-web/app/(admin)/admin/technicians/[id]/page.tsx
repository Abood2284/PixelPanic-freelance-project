// apps/pixel-panic-web/app/(admin)/technicians/[id]/page.tsx

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fakeTechnicians } from "../fake-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconClockHour4,
  IconBriefcase,
  IconStarFilled,
} from "@tabler/icons-react";

interface TechnicianDetailPageProps {
  params: Promise<{ id: string }>;
}

// In a real app, this would be an API call.
async function getTechnicianDetails(id: string) {
  const technician = fakeTechnicians.find((tech) => tech.id === id);
  if (!technician) {
    notFound();
  }
  return technician;
}

export default async function TechnicianDetailPage({
  params,
}: TechnicianDetailPageProps) {
  const { id } = await params;
  const tech = await getTechnicianDetails(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/technicians">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to All Technicians
          </Link>
        </Button>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:text-left">
          <Image
            src={tech.imageUrl}
            alt={tech.name}
            width={96}
            height={96}
            className="rounded-full"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{tech.name}</h2>
            <p className="text-slate-500">{tech.phoneNumber}</p>
            <Badge className="mt-2 capitalize">
              {tech.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {tech.performance.totalJobs}
              </div>
              <div className="text-sm text-slate-500">Total Jobs</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                <IconStarFilled className="h-5 w-5 text-amber-400" />
                {tech.rating.toFixed(1)}
              </div>
              <div className="text-sm text-slate-500">Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {tech.performance.successRate}%
              </div>
              <div className="text-sm text-slate-500">Success</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {tech.currentJob && (
            <Card className="border-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBriefcase className="text-orange-500" /> Current
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Order ID:</strong> PP-{tech.currentJob.orderId}
                </p>
                <p>
                  <strong>Customer:</strong> {tech.currentJob.customerName}
                </p>
                <p>
                  <strong>Service:</strong> {tech.currentJob.issue}
                </p>
                <p>
                  <strong>Estimated Completion:</strong> {tech.currentJob.eta}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Job History</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This could be another table component */}
              <ul className="space-y-2 text-sm">
                {tech.jobHistory.map((job) => (
                  <li key={job.orderId} className="flex justify-between">
                    <span>
                      PP-{job.orderId}: {job.issue}
                    </span>
                    <Badge
                      variant={
                        job.status === "completed" ? "default" : "destructive"
                      }
                    >
                      {job.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <IconShieldCheck
                  className={
                    tech.verification.aadhaar === "verified"
                      ? "text-green-500"
                      : "text-slate-400"
                  }
                />
                Aadhaar Verified
              </div>
              <div className="flex items-center gap-2">
                <IconShieldCheck
                  className={
                    tech.verification.pan === "verified"
                      ? "text-green-500"
                      : "text-slate-400"
                  }
                />
                PAN Verified
              </div>
              <div className="flex items-center gap-2">
                <IconShieldCheck
                  className={
                    tech.verification.police === "verified"
                      ? "text-green-500"
                      : "text-slate-400"
                  }
                />
                Police Verification
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>
                <strong>Email:</strong> {tech.personalInfo.email}
              </p>
              <p>
                <strong>Address:</strong> {tech.personalInfo.address}
              </p>
              <p>
                <strong>Emergency:</strong>{" "}
                {tech.personalInfo.emergencyContact.name} (
                {tech.personalInfo.emergencyContact.phone})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
