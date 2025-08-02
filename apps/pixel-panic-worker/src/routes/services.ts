import { Hono } from "hono";
import { brands, models, issues, modelIssues } from "@repo/db/schema";
import { sql } from "drizzle-orm";

const servicesRoutes = new Hono();

// Get all services for a brand and model
servicesRoutes.get("/", async (c) => {
  const brandName = c.req.query("brand");
  const modelName = c.req.query("model");

  if (!brandName || !modelName) {
    return c.json({ error: "Brand and model required" }, 400);
  }

  try {
    console.log(`Looking for brand: ${brandName}, model: ${modelName}`);

    // Find brand by name (case-insensitive)
    const brand = await c.req.db.query.brands.findFirst({
      where: (b) => sql`lower(${b.name}) = lower(${brandName})`,
    });

    if (!brand) {
      console.log(`Brand not found: ${brandName}`);
      return c.json({ error: "Brand not found" }, 404);
    }

    console.log(`Found brand: ${brand.name} with ID: ${brand.id}`);

    // Find model by name and brand (case-insensitive)
    const model = await c.req.db.query.models.findFirst({
      where: (m) =>
        sql`lower(${m.name}) = lower(${modelName}) AND ${m.brandId} = ${brand.id}`,
    });

    if (!model) {
      console.log(`Model not found: ${modelName} for brand ${brand.name}`);
      return c.json({ error: "Model not found" }, 404);
    }

    console.log(`Found model: ${model.name} with ID: ${model.id}`);

    // Get all services (issues) for this model with pricing
    const modelServices = await c.req.db.query.modelIssues.findMany({
      where: (mi) => sql`${mi.modelId} = ${model.id}`,
      orderBy: (mi, { asc }) => [asc(mi.issueId)],
    });

    console.log(
      "Model services from DB:",
      JSON.stringify(modelServices, null, 2)
    );

    if (modelServices.length === 0) {
      return c.json({
        brand,
        model,
        services: [],
        message: "No services found for this model",
      });
    }

    // Get the issue details for each service
    const issueIds = modelServices.map((service) => service.issueId);
    console.log("Issue IDs:", issueIds);

    // Get issues one by one to avoid the IN clause issue
    const issues = [];
    for (const issueId of issueIds) {
      const issue = await c.req.db.query.issues.findFirst({
        where: (i) => sql`${i.id} = ${issueId}`,
      });
      if (issue) {
        issues.push(issue);
      }
    }

    console.log("Issues from DB:", JSON.stringify(issues, null, 2));

    // Create a map of issue details
    const issueMap = new Map(issues.map((issue) => [issue.id, issue]));

    // Transform the data to match the frontend expectations
    const transformedServices = modelServices.map((service) => {
      const issue = issueMap.get(service.issueId);

      return {
        id: service.issueId.toString(),
        name: issue ? issue.name : `Service ${service.issueId}`,
        description: issue ? issue.description || "" : "Service description",
        estimatedRepairTime: 30, // Default repair time in minutes
        pricing: {
          OEM: {
            type: "OEM",
            price: Number(service.priceOriginal) || 0,
            originalPrice: Number(service.priceOriginal) || 0,
            quality: "Original",
            warranty: "12 months",
            description:
              "Original equipment manufacturer parts with factory quality",
          },
          Aftermarket: {
            type: "Aftermarket",
            price: Number(service.priceAftermarketTier1) || 0,
            originalPrice: Number(service.priceAftermarketTier1) || 0,
            quality: "Compatible",
            warranty: "6 months",
            description:
              "High-quality compatible parts with excellent performance",
          },
        },
      };
    });

    return c.json({
      brand,
      model,
      services: transformedServices,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default servicesRoutes;
