// api.ts
import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { flows } from "./flows.ts";

const app = new Hono();

function validateFlowSlugs(slugs: string[]): string[] {
  const validSlugs = Object.keys(flows);
  const invalidSlugs = slugs.filter((slug) => !validSlugs.includes(slug));

  if (invalidSlugs.length > 0) {
    throw new Error(`Invalid flow slugs: ${invalidSlugs.join(", ")}`);
  }

  return slugs;
}

app.get("/", async (c) => {
  return c.json({ message: "server is live" });
});

app.post("/api/flows", async (c) => {
  try {
    const body = await c.req.json();
    console.log("[API] Request body:", body);

    // Handle both { slugs: ["kyc_flow"] } and ["kyc_flow"] formats
    const slugs = body.slugs || body;

    if (!Array.isArray(slugs)) {
      return c.json(
        {
          success: false,
          error: "Invalid request body",
          details: "Request must include an array of flow slugs",
        },
        400
      );
    }

    try {
      const validatedSlugs = validateFlowSlugs(slugs);
      const requestedFlows = validatedSlugs.reduce((acc, slug) => {
        acc[slug] = flows[slug];
        return acc;
      }, {});

      return c.json({
        success: true,
        flows: requestedFlows,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: "Validation failed",
          details: error.message,
        },
        400
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Request failed",
        details: error.message,
      },
      500
    );
  }
});

export default app;
