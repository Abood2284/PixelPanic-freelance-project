import { Hono } from "hono";
import { brands } from "@repo/db/schema";

const brandsRoutes = new Hono();

brandsRoutes.get("/", async (c) => {
  const allBrands = await c.req.db.query.brands.findMany({
    orderBy: (b, { asc }) => [asc(b.name)],
  });
  console.log("[brands] allBrands", allBrands);

  // Add caching headers - brands rarely change
  c.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
  c.header("ETag", `"brands-${allBrands.length}"`);

  return c.json(allBrands);
});

export default brandsRoutes;
