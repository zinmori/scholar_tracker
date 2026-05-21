import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Opportunity from "@/models/Opportunity";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user requesting the opportunities
    await authenticateRequest(request);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "Tous";
    const country = searchParams.get("country") || "Tous";

    // Set today at 00:00 UTC
    const today = new Date();
    const todayUtc = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));

    // Base query: only opportunities that haven't expired
    const query: any = {
      deadline: { $gte: todayUtc }
    };

    // Keyword search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { program: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } }
      ];
    }

    // Type filter
    if (type !== "Tous") {
      query.type = type;
    }

    // Country filter
    if (country !== "Tous") {
      query.country = country;
    }

    // Fetch and sort by deadline ascending (closest first)
    const opportunities = await Opportunity.find(query).sort({ deadline: 1 });

    return NextResponse.json({ success: true, opportunities });
  } catch (error: any) {
    console.error("[Opportunities API] Error fetching:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
