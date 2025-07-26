import { Hono } from "hono";
import { brands } from "@repo/db/schema";

const brandsRoutes = new Hono();

brandsRoutes.get("/", async (c) => {
  const allBrands = await c.req.db.query.brands.findMany({
    orderBy: (b, { asc }) => [asc(b.name)],
  });
  return c.json(allBrands);
});

export default brandsRoutes;
