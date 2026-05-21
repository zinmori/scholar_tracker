declare global {
  var reminderTimer: NodeJS.Timeout | undefined;
}

export async function register() {
  // Only run scheduler on the Node.js server-side runtime
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runReminders } = await import("@/lib/reminders");

    const targetHourUtc = 8;
    const targetMinuteUtc = 0;

    function scheduleNext() {
      const now = new Date();
      const nextRun = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // Schedule for tomorrow
        targetHourUtc,
        targetMinuteUtc,
        0,
        0
      ));
      
      const delay = nextRun.getTime() - now.getTime();
      console.log(`[Scheduler] Next email reminder run scheduled at ${nextRun.toUTCString()} (in ${Math.round(delay / 1000 / 60)} minutes)`);
      
      global.reminderTimer = setTimeout(async () => {
        console.log(`[Scheduler] Running scheduled email reminders at 8:00 AM GMT...`);
        try {
          await runReminders();
        } catch (error) {
          console.error(`[Scheduler] Error during scheduled reminders:`, error);
        }
        scheduleNext();
      }, delay);
    }

    // Cancel existing timer if any (handles dev mode hot-reloads)
    if (global.reminderTimer) {
      console.log("[Scheduler] Clearing existing reminder timer due to server reload.");
      clearTimeout(global.reminderTimer);
      global.reminderTimer = undefined;
    }

    // Calculate initial schedule
    const now = new Date();
    let nextRun = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      targetHourUtc,
      targetMinuteUtc,
      0,
      0
    ));

    // If it's already past 8:00 AM GMT today, schedule for tomorrow
    if (now.getTime() >= nextRun.getTime()) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    const initialDelay = nextRun.getTime() - now.getTime();
    console.log(`[Scheduler] Initial email reminder run scheduled at ${nextRun.toUTCString()} (in ${Math.round(initialDelay / 1000 / 60)} minutes)`);

    global.reminderTimer = setTimeout(async () => {
      console.log(`[Scheduler] Running scheduled email reminders at 8:00 AM GMT...`);
      try {
        await runReminders();
      } catch (error) {
        console.error(`[Scheduler] Error during scheduled reminders:`, error);
      }
      scheduleNext();
    }, initialDelay);
  }
}
