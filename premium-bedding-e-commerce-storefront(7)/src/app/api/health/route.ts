import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    try {
      await seedDatabase();
    } catch (e) {
      console.warn("Auto-seed on healthcheck warning:", e);
    }
    return Response.json({ ok: true, status: "healthy" });
  } catch (err) {
    console.error("Healthcheck error:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
