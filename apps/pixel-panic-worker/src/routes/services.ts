import { Hono } from "hono";
import { brands, models, issues, modelIssues } from "@repo/db/schema";
import { sql } from "drizzle-orm";

const servicesRoutes = new Hono();

// Get all services for a brand and model - OPTIMIZED VERSION
servicesRoutes.get("/", async (c) => {
  const brandName = c.req.query("brand");
  const modelName = c.req.query("model");

  if (!brandName || !modelName) {
    return c.json({ error: "Brand and model required" }, 400);
  }

  try {
    console.log(`Looking for brand: ${brandName}, model: ${modelName}`);

    // OPTIMIZATION 1: Single query with JOINs instead of multiple separate queries
    // This fetches brand, model, services, and issues all in one go
    const result = await c.req.db
      .select({
        brandId: brands.id,
        brandName: brands.name,
        modelId: models.id,
        modelName: models.name,
        modelImageUrl: models.imageUrl,
        issueId: issues.id,
        issueName: issues.name,
        issueDescription: issues.description,
        originalPrice: modelIssues.originalPrice,
        aftermarketPrice: modelIssues.aftermarketPrice,
      })
      .from(brands)
      .innerJoin(models, sql`${models.brandId} = ${brands.id}`)
      .innerJoin(modelIssues, sql`${modelIssues.modelId} = ${models.id}`)
      .innerJoin(issues, sql`${issues.id} = ${modelIssues.issueId}`)
      .where(
        sql`lower(${brands.name}) = lower(${brandName}) AND lower(${models.name}) = lower(${modelName})`
      );

    if (result.length === 0) {
      console.log(`No data found for brand: ${brandName}, model: ${modelName}`);
      return c.json({
        brand: { name: brandName },
        model: { name: modelName },
        services: [],
        message: "No services found for this model",
      });
    }

    // Extract brand and model info from first result
    const brand = {
      id: result[0].brandId,
      name: result[0].brandName,
    };

    const model = {
      id: result[0].modelId,
      name: result[0].modelName,
      imageUrl: result[0].modelImageUrl,
    };

    // Transform the data to match frontend expectations
    const transformedServices = result
      .map((row) => {
        const oemPrice = Number(row.originalPrice) || 0;
        const aftermarketPrice = Number(row.aftermarketPrice) || 0;

        // Only include services that have at least OEM pricing
        if (oemPrice <= 0) {
          return null;
        }

        return {
          id: row.issueId.toString(),
          name: row.issueName,
          description: row.issueDescription || "Service description",
          estimatedRepairTime: 30, // Default repair time in minutes
          pricing: {
            OEM: {
              type: "OEM",
              price: oemPrice,
              originalPrice: oemPrice,
              quality: "Original",
              warranty: "90 Days",
              description:
                "Original equipment manufacturer parts with factory quality",
            },
            Aftermarket: {
              type: "Aftermarket",
              price: aftermarketPrice,
              originalPrice: aftermarketPrice,
              quality: "Compatible",
              warranty: "30 Days",
              description:
                "High-quality compatible parts with excellent performance",
            },
          },
        };
      })
      .filter(Boolean); // Remove null entries

    console.log(
      `Found ${transformedServices.length} services for ${brandName} ${modelName}`
    );

    // OPTIMIZATION 2: Add proper caching headers
    // Cache for 24 hours since data rarely changes
    c.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
    c.header("ETag", `"${brand.id}-${model.id}-${transformedServices.length}"`);

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
