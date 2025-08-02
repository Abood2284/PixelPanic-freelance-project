export type TOrderSummary = {
  id: number;
  status:
    | "pending_payment"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled";
  totalAmount: string;
  createdAt: string;
  user: {
    name: string | null;
    phoneNumber: string;
  };
};

export type TOrderDetail = {
  id: number;
  status:
    | "pending_payment"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled";
  totalAmount: string;
  serviceMode: "doorstep" | "carry_in";
  timeSlot: string | null;
  createdAt: string;
  user: {
    name: string | null;
    phoneNumber: string;
    email: string | null;
  };
  address: {
    fullName: string;
    phoneNumber: string;
    email: string | null;
    pincode: string;
    flatAndStreet: string;
    landmark: string | null;
  } | null; // Address can be null for 'carry_in' orders
  orderItems: {
    id: number;
    issueName: string;
    modelName: string;
    grade: string;
    priceAtTimeOfOrder: string;
  }[];
};

// New types for the Technicians section
export type TTechnicianSummary = {
  id: string;
  name: string;
  phoneNumber: string;
  status: "active" | "on_leave" | "inactive";
  avgCompletionTimeMinutes: number;
  rating: number; // Out of 5
  imageUrl: string;
};

export type TTechnicianDetail = TTechnicianSummary & {
  personalInfo: {
    email: string;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  };
  verification: {
    aadhaar: "verified" | "pending";
    pan: "verified" | "pending";
    police: "verified" | "pending";
  };
  performance: {
    totalJobs: number;
    totalEarnings: number; // in INR
    successRate: number; // percentage
    failedJobs: number;
  };
  currentJob: {
    orderId: number;
    customerName: string;
    issue: string;
    eta: string; // e.g., "4:30 PM"
  } | null;
  jobHistory: {
    orderId: number;
    status: "completed" | "failed";
    customerName: string;
    issue: string;
    date: string;
  }[];
};
