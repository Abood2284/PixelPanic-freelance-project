import { Hono } from "hono";
import { brands, models } from "@repo/db/schema";
import { sql } from "drizzle-orm";

const modelsRoutes = new Hono();

modelsRoutes.get("/", async (c) => {
  const brandName = c.req.query("brand");
  if (!brandName) return c.json({ error: "Brand required" }, 400);

  try {
    // Find brand by name (case-insensitive)
    const brand = await c.req.db.query.brands.findFirst({
      where: (b) => sql`lower(${b.name}) = lower(${brandName})`,
    });

    if (!brand) {
      console.error(`Brand not found: ${brandName}`);
      return c.json({ error: "Brand not found" }, 404);
    }

    console.log(`Found brand: ${brand.name} with ID: ${brand.id}`);

    // Get all models for this brand
    const brandModels = await c.req.db.query.models.findMany({
      where: (m) => sql`${m.brandId} = ${brand.id}`,
      orderBy: (m, { asc }) => [asc(m.name)],
    });

    console.log(`Found ${brandModels.length} models for brand ${brand.name}`);

    return c.json({ brand, models: brandModels });
  } catch (error) {
    console.error("Error in models route:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default modelsRoutes;
