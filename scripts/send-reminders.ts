import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function main() {
  console.log("⏰ [CLI] Starting manual email reminder execution...");
  try {
    const { runReminders } = await import("../src/lib/reminders");
    const result = await runReminders();
    console.log("✅ [CLI] Execution finished successfully:");
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error: any) {
    console.error("❌ [CLI] Execution failed with error:", error);
    process.exit(1);
  }
}

main();
