# Admin Dashboard Development Playbook

_Version 1.0 - January 27, 2025_

This playbook provides comprehensive guidelines for developing and maintaining the PixelPanic Admin Dashboard. It covers coding standards, component patterns, API conventions, and best practices based on the existing implementation.

---

## 1. Project Structure

### **Admin-Specific Directories**

```
apps/pixel-panic-web/
├── app/(admin)/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── technicians/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── fake-data.ts
│   │   ├── pricing/
│   │   │   ├── add-brand/
│   │   │   │   └── page.tsx
│   │   │   └── add-model/
│   │   │       └── page.tsx
│   │   ├── technician-invitations/
│   │   │   └── page.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── forbidden/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── components/
│   │       ├── stat-card.tsx
│   │       ├── orders-table.tsx
│   │       ├── technicians-table.tsx
│   │       ├── add-phone-form.tsx
│   │       ├── add-phone-form-skeleton.tsx
│   │       ├── copy-button.tsx
│   │       └── logout-link.tsx
├── components/
│   ├── admin/
│   │   ├── copy-button.tsx
│   │   └── logout-link.tsx
│   └── ui/
│       └── [shadcn components]
├── types/
│   └── admin.ts
└── lib/
    ├── auth-middleware.ts
    └── dev-auth.ts
```

### **Backend Structure**

```
apps/pixel-panic-worker/
├── src/
│   ├── routes/
│   │   └── admin.ts
│   └── services/
└── packages/
    ├── db/
    │   └── schema.ts
    └── validators/
        └── admin.ts
```

---

## 2. Coding Standards

### **TypeScript Conventions**

```typescript
// ✅ Preferred: Interfaces for admin types
interface TOrderSummary {
  id: number;
  status: OrderStatus;
  totalAmount: string;
  createdAt: string;
  user: {
    name: string | null;
    phoneNumber: string;
  };
}

// ✅ Preferred: Enums for status values
type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

// ✅ Preferred: Descriptive variable names
const monthlyRevenue = summary.monthlyRevenue;
const completedJobsCount = summary.completedJobs;
const pendingOrdersCount = summary.pendingOrders;
```

### **Component Patterns**

```typescript
// ✅ Server Component Pattern
export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Dashboard Overview
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue (Last 30d)"
          value={`₹${data.summary.monthlyRevenue.toLocaleString("en-IN")}`}
          icon={<IconCurrencyRupee className="h-5 w-5" />}
        />
      </div>

      <Suspense fallback={<p>Loading recent orders...</p>}>
        <OrdersTable orders={data.recentOrders} />
      </Suspense>
    </div>
  );
}

// ✅ Client Component Pattern
"use client";
export function OrdersTable({ orders }: OrdersTableProps) {
  const [open, setOpen] = useState<null | number>(null);
  const [loading, setLoading] = useState(false);

  async function assignTechnician(orderId: number) {
    setLoading(true);
    try {
      // API call logic
    } finally {
      setLoading(false);
    }
  }

  return (
    <Table>
      {/* Table content */}
    </Table>
  );
}
```

### **Error Handling**

```typescript
// ✅ Preferred: Early returns with error handling
async function getDashboardData(): Promise<DashboardData> {
  const response = await apiFetch("/admin/dashboard", {
    next: { revalidate: 300 },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data.");
  }

  return response.json();
}

// ✅ Preferred: Try-catch with specific error types
try {
  const result = await assignOrder(orderId, technicianId);
  toast.success("Order assigned successfully!");
} catch (error) {
  console.error("Assignment failed:", error);
  toast.error(
    error instanceof Error ? error.message : "Failed to assign order"
  );
}
```

---

## 3. API Development

### **Route Structure**

```typescript
// ✅ Preferred: Organized admin routes
const adminRoutes = new Hono<{ Bindings: Env }>();

// Dashboard endpoints
adminRoutes.get("/dashboard", async (c) => {
  try {
    const db = c.req.db;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const statsQuery = await db
      .select({
        monthlyRevenue:
          sql`SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.totalAmount} ELSE 0 END)`.as(
            "monthly_revenue"
          ),
        completedJobs:
          sql`COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END)`.as(
            "completed_jobs"
          ),
        pendingOrders:
          sql`COUNT(CASE WHEN ${orders.status} IN ('confirmed', 'in_progress') THEN 1 END)`.as(
            "pending_orders"
          ),
      })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo));

    const summary = {
      monthlyRevenue: Number(statsQuery[0]?.monthlyRevenue) || 0,
      completedJobs: Number(statsQuery[0]?.completedJobs) || 0,
      pendingOrders: Number(statsQuery[0]?.pendingOrders) || 0,
      averageRepairTimeMinutes: 85,
    };

    const recentOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 10,
      with: {
        user: {
          columns: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    return c.json({ summary, recentOrders });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw new HTTPException(500, {
      message: "Could not retrieve dashboard data.",
    });
  }
});
```

### **Validation Patterns**

```typescript
// ✅ Preferred: Zod schemas for validation
const addBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters.")
    .max(100, "Brand name cannot exceed 100 characters.")
    .regex(
      /^[a-zA-Z0-9\s\-&.]+$/,
      "Brand name can only contain letters, numbers, spaces, hyphens, ampersands, and periods."
    ),
  logoUrl: z.string().url().optional(),
});

// ✅ Preferred: Validation in route handlers
adminRoutes.post("/add-brand", async (c) => {
  const body = await c.req.json();
  const validation = addBrandSchema.safeParse(body);

  if (!validation.success) {
    return c.json(
      {
        message: "Invalid form data.",
        errors: validation.error.flatten().fieldErrors,
      },
      400
    );
  }

  // Process validated data
});
```

---

## 4. Database Operations

### **Query Patterns**

```typescript
// ✅ Preferred: Relational queries with Drizzle
const orderData = await c.req.db.query.orders.findFirst({
  where: eq(schema.orders.id, orderId),
  with: {
    user: true,
    address: true,
    orderItems: true,
  },
});

// ✅ Preferred: Complex aggregations with SQL
const statsQuery = await db
  .select({
    monthlyRevenue:
      sql`SUM(CASE WHEN ${orders.status} = 'completed' THEN ${orders.totalAmount} ELSE 0 END)`.as(
        "monthly_revenue"
      ),
    completedJobs:
      sql`COUNT(CASE WHEN ${orders.status} = 'completed' THEN 1 END)`.as(
        "completed_jobs"
      ),
  })
  .from(orders)
  .where(gte(orders.createdAt, thirtyDaysAgo));

// ✅ Preferred: Transactions for complex operations
await db.transaction(async (tx) => {
  const [newModel] = await tx
    .insert(models)
    .values({ brandId, name: modelName })
    .returning();

  const modelIssuesData = selectedIssues.map((issue) => ({
    modelId: newModel.id,
    issueId: issue.issueId,
    priceOriginal: issue.priceOriginal?.toString() || null,
    priceAftermarketTier1: issue.priceAftermarketTier1?.toString() || null,
  }));

  await tx.insert(modelIssues).values(modelIssuesData);
});
```

---

## 5. UI/UX Standards

### **Component Design**

```typescript
// ✅ Preferred: Reusable stat cards
export function StatCard({
  title,
  value,
  icon
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// ✅ Preferred: Status badges with consistent styling
const statusVariantMap: Record<
  TOrderSummary["status"],
  "default" | "secondary" | "destructive" | "warning"
> = {
  pending_payment: "warning",
  confirmed: "secondary",
  in_progress: "secondary",
  completed: "default",
  cancelled: "destructive",
};

<Badge
  variant={statusVariantMap[order.status] ?? "secondary"}
  className="capitalize"
>
  {order.status.replace("_", " ")}
</Badge>
```

### **Form Patterns**

```typescript
// ✅ Preferred: React Hook Form with Zod validation
export function AddBrandForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(addBrandSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding brand...");

    try {
      const response = await fetch(`${WORKER_API_URL}/api/admin/add-brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create brand");
      }

      form.reset();
      toast.success("Brand created successfully!", { id: toastId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create brand",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apple, Samsung" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

---

## 6. Security Best Practices

### **Authentication & Authorization**

```typescript
// ✅ Preferred: Role-based middleware
export async function requireAdmin(redirectTo: string = "/admin/sign-in") {
  const auth = await getAuth();

  if (!auth?.user || auth.user.role !== "admin") {
    redirect(redirectTo);
  }

  return auth;
}

// ✅ Preferred: API route protection
adminRoutes.get("/dashboard", async (c) => {
  // Verify admin role in middleware or route handler
  const user = await verifyAdminRole(c);

  // Proceed with admin-only operations
});
```

### **Input Validation**

```typescript
// ✅ Preferred: Comprehensive validation
const assignOrderSchema = z.object({
  orderId: z.number().int().positive(),
  technicianId: z.string().min(1, "Technician ID is required"),
});

// ✅ Preferred: Sanitize user inputs
const sanitizedData = {
  name: data.name.trim().replace(/[<>]/g, ""),
  phoneNumber: data.phoneNumber.replace(/\D/g, ""),
};
```

---

## 7. Performance Optimization

### **Data Fetching**

```typescript
// ✅ Preferred: Server-side data fetching with caching
async function getDashboardData(): Promise<DashboardData> {
  const response = await apiFetch("/admin/dashboard", {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data.");
  }

  return response.json();
}

// ✅ Preferred: Optimistic updates for better UX
async function assignOrder(orderId: number, technicianId: string) {
  // Optimistically update UI
  setOrders((prev) =>
    prev.map((order) =>
      order.id === orderId
        ? { ...order, technicianId, status: "confirmed" }
        : order
    )
  );

  try {
    const response = await fetch("/api/admin/assign-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, technicianId }),
    });

    if (!response.ok) {
      throw new Error("Assignment failed");
    }

    return response.json();
  } catch (error) {
    // Revert optimistic update on error
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, technicianId: null, status: "pending_payment" }
          : order
      )
    );
    throw error;
  }
}
```

### **Component Optimization**

```typescript
// ✅ Preferred: Memoize expensive components
export const OrdersTable = memo(function OrdersTable({
  orders
}: OrdersTableProps) {
  // Component logic
});

// ✅ Preferred: Lazy load non-critical components
const AnalyticsChart = lazy(() => import("./AnalyticsChart"));

export function DashboardPage() {
  return (
    <div>
      <StatCards />
      <Suspense fallback={<AnalyticsChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>
    </div>
  );
}
```

---

## 8. Testing Guidelines

### **Unit Testing**

```typescript
// ✅ Preferred: Test critical business logic
describe("Order Assignment", () => {
  it("should assign order to technician and generate OTP", async () => {
    const orderId = 123;
    const technicianId = "tech-456";

    const result = await assignOrder(orderId, technicianId);

    expect(result.orderId).toBe(orderId);
    expect(result.technicianId).toBe(technicianId);
    expect(result.completionOtp).toHaveLength(6);
    expect(result.completionOtp).toMatch(/^\d{6}$/);
  });
});
```

### **Integration Testing**

```typescript
// ✅ Preferred: Test API endpoints
describe("Admin API", () => {
  it("should return dashboard data", async () => {
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("summary");
    expect(response.body).toHaveProperty("recentOrders");
  });
});
```

---

## 9. Deployment & Monitoring

### **Environment Configuration**

```typescript
// ✅ Preferred: Environment-specific configuration
const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  },
  auth: {
    devMode: process.env.NEXT_PUBLIC_DEV_MODE === "true",
    devRole: process.env.NEXT_PUBLIC_DEV_ROLE,
  },
};
```

### **Error Monitoring**

```typescript
// ✅ Preferred: Comprehensive error logging
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error("Operation failed:", {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    context: { userId, operation, timestamp: new Date().toISOString() },
  });

  // Send to error monitoring service
  captureException(error);

  throw error;
}
```

---

## 10. Development Workflow

### **Feature Development Process**

1. **Plan**: Review requirements and create implementation plan
2. **Code**: Follow established patterns and conventions
3. **Test**: Write unit and integration tests
4. **Review**: Self-review and peer review
5. **Deploy**: Test in staging environment
6. **Monitor**: Watch for errors and performance issues

### **Code Review Checklist**

- [ ] Follows TypeScript conventions
- [ ] Implements proper error handling
- [ ] Includes appropriate validation
- [ ] Uses established component patterns
- [ ] Includes necessary tests
- [ ] Follows security best practices
- [ ] Optimized for performance
- [ ] Accessible and responsive

This playbook ensures consistent, high-quality development across the admin dashboard while maintaining the established patterns and conventions.
