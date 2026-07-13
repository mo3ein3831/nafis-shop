import { NextResponse } from "next/server";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { seedDatabase } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabase();
    const allCollections = await db.select().from(collections);
    return NextResponse.json({ collections: allCollections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
