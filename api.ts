// api.ts
import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { flows } from "./flows.ts";

const app = new Hono();

app.get("/", async (c) => {
  return c.json({ message: "Server is live" });
});

app.get("/api/flows", async (c) => {
  try {
    const slug = c.req.query("slugs");
    console.log("[API] Requested slug:", slug);

    if (!slug) {
      return c.json(
        {
          success: false,
          error: "Invalid request",
          details: "No slug provided in query parameter",
        },
        400
      );
    }

    if (!flows[slug]) {
      return c.json(
        {
          success: false,
          error: "Invalid slug",
          details: `Flow '${slug}' not found`,
        },
        400
      );
    }

    return c.json({
      success: true,
      flows: {
        [slug]: flows[slug],
      },
    });
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
