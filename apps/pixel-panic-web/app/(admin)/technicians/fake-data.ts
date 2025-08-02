// apps/pixel-panic-web/lib/fake-data.ts

import type { TTechnicianDetail } from "@/types/admin";

export const fakeTechnicians: TTechnicianDetail[] = [
  {
    id: "tech-001",
    name: "Rakesh Sharma",
    phoneNumber: "+91 98765 43210",
    status: "active",
    avgCompletionTimeMinutes: 75,
    rating: 4.8,
    imageUrl: "https://i.pravatar.cc/150?u=tech-001",
    personalInfo: {
      email: "rakesh.s@example.com",
      address: "123, Andheri West, Mumbai, 400058",
      emergencyContact: { name: "Sunita Sharma", phone: "+91 98765 11111" },
    },
    verification: { aadhaar: "verified", pan: "verified", police: "verified" },
    performance: {
      totalJobs: 152,
      totalEarnings: 95000,
      successRate: 98,
      failedJobs: 3,
    },
    currentJob: {
      orderId: 1024,
      customerName: "Priya Singh",
      issue: "iPhone 14 Pro Screen Replacement",
      eta: "4:15 PM",
    },
    jobHistory: [
      {
        orderId: 1023,
        status: "completed",
        customerName: "Amit Patel",
        issue: "Samsung S23 Battery",
        date: "2025-08-01",
      },
      {
        orderId: 1021,
        status: "completed",
        customerName: "Neha Gupta",
        issue: "OnePlus 11 Speaker",
        date: "2025-07-31",
      },
    ],
  },
  {
    id: "tech-002",
    name: "Suresh Verma",
    phoneNumber: "+91 91234 56789",
    status: "on_leave",
    avgCompletionTimeMinutes: 85,
    rating: 4.6,
    imageUrl: "https://i.pravatar.cc/150?u=tech-002",
    personalInfo: {
      email: "suresh.v@example.com",
      address: "456, Bandra East, Mumbai, 400051",
      emergencyContact: { name: "Geeta Verma", phone: "+91 91234 22222" },
    },
    verification: { aadhaar: "verified", pan: "verified", police: "pending" },
    performance: {
      totalJobs: 98,
      totalEarnings: 62000,
      successRate: 95,
      failedJobs: 5,
    },
    currentJob: null,
    jobHistory: [
      {
        orderId: 1019,
        status: "completed",
        customerName: "Raj Kumar",
        issue: "Pixel 7 Pro Camera",
        date: "2025-07-28",
      },
      {
        orderId: 1018,
        status: "failed",
        customerName: "Anjali Mehta",
        issue: "Redmi Note 12 Charging Port",
        date: "2025-07-27",
      },
    ],
  },
];
