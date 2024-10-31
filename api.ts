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
    console.log("[API] Parsing request body");
    const slugs = await c.req.json(); // Expecting direct array
    console.log("[API] Requested slugs:", slugs);

    if (!Array.isArray(slugs)) {
      return c.json(
        {
          success: false,
          error: "Invalid request body",
          details: "Request body must be an array of flow slugs",
        },
        400
      );
    }

    try {
      console.log("[API] Validating flow slugs");
      const validatedSlugs = validateFlowSlugs(slugs);

      console.log("[API] Fetching requested flows");
      const requestedFlows = validatedSlugs.reduce((acc, slug) => {
        acc[slug] = flows[slug];
        return acc;
      }, {});

      return c.json({
        success: true,
        flows: requestedFlows,
      });
    } catch (error) {
      console.error("[API] Validation failed:", error.message);
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
    console.error("[API] Request failed:", error);
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
