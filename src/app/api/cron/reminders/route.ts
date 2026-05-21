import { NextRequest, NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  const cronSecret = process.env.CRON_SECRET;

  // Enforce secret validation if CRON_SECRET is configured
  if (
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}` &&
    secretParam !== cronSecret
  ) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing secret token" },
      { status: 401 }
    );
  }

  try {
    const result = await runReminders();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Cron API] Error running reminders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute reminders" },
      { status: 500 }
    );
  }
}
