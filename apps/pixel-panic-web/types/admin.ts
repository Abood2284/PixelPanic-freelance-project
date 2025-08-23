export type TOrderSummary = {
  id: number;
  orderNumber: string;
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
  orderNumber: string;
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

// ============================================================================
// COUPON TYPES
// ============================================================================

export type TCouponType = "percentage" | "fixed_amount" | "service_upgrade";
export type TCouponStatus = "active" | "inactive" | "expired";
export type TServiceMode = "doorstep" | "carry_in";

export type TCouponSummary = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: TCouponType;
  value: string; // numeric as string
  minimumOrderAmount: string;
  maximumDiscount: string | null;
  totalUsageLimit: number | null;
  perUserUsageLimit: number;
  validFrom: string;
  validUntil: string;
  status: TCouponStatus;
  applicableServiceModes: TServiceMode[] | null;
  applicableBrandIds: number[] | null;
  applicableModelIds: number[] | null;
  totalUsageCount: number;
  totalDiscountGiven: string;
  createdAt: string;
  createdByAdmin: {
    name: string | null;
    phoneNumber: string;
  };
};

export type TCouponDetail = TCouponSummary & {
  usageHistory: {
    id: number;
    orderId: number;
    userId: string;
    discountAmount: string;
    orderAmountBeforeDiscount: string;
    orderAmountAfterDiscount: string;
    usedAt: string;
    user: {
      name: string | null;
      phoneNumber: string;
    };
    order: {
      status: string;
      serviceMode: TServiceMode;
    };
  }[];
};

export type TCouponCreateInput = {
  code: string;
  name: string;
  description?: string;
  type: TCouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  totalUsageLimit?: number;
  perUserUsageLimit?: number;
  validFrom: string;
  validUntil: string;
  applicableServiceModes?: TServiceMode[];
  applicableBrandIds?: number[];
  applicableModelIds?: number[];
};

export type TCouponUpdateInput = Partial<TCouponCreateInput> & {
  status?: TCouponStatus;
};

export type TCouponUsageStats = {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalDiscountGiven: string;
  averageDiscountPerOrder: string;
  mostUsedCoupon: {
    code: string;
    usageCount: number;
    totalDiscount: string;
  } | null;
};
