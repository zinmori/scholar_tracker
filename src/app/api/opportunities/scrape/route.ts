import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { scrapeOpportunities } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user first
    await authenticateRequest(request);

    console.log("[Scrape API] Manually triggering opportunities scrape...");
    const result = await scrapeOpportunities();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Scrape API] Scraping failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger scraping" },
      { status: 500 }
    );
  }
}
