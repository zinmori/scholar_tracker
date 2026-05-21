import connectDB from "./mongodb";
import Application from "@/models/Application";
import User from "@/models/User";
import { sendEmail, generateReminderEmail } from "./email";

export async function runReminders() {
  // Ensure DB is connected
  await connectDB();

  // Get current date/time in UTC, and set to start of the day UTC
  const today = new Date();
  const todayUtc = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
    0, 0, 0, 0
  ));

  console.log(`[Reminders] Fetching "En cours" applications with deadline >= ${todayUtc.toISOString()}`);

  // Find all applications with status "En cours" and deadline >= todayUtc
  const applications = await Application.find({
    status: "En cours",
    deadline: { $gte: todayUtc }
  });

  if (applications.length === 0) {
    console.log("[Reminders] No matching pending applications found.");
    return { success: true, emailsSent: 0, message: "No applications found to remind." };
  }

  // Group applications by userId
  const userAppsMap: Record<string, typeof applications> = {};
  for (const app of applications) {
    const userIdStr = app.userId.toString();
    if (!userAppsMap[userIdStr]) {
      userAppsMap[userIdStr] = [];
    }
    userAppsMap[userIdStr].push(app);
  }

  let emailsSent = 0;
  const errors: string[] = [];
  const details: Array<{ email: string; appCount: number }> = [];

  for (const [userId, userApps] of Object.entries(userAppsMap)) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`[Reminders] User with ID ${userId} not found in database. Skipping.`);
        continue;
      }

      // Sort applications by deadline ascending (soonest first)
      userApps.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

      // Generate HTML & text templates
      const { html, text } = generateReminderEmail(user.name, userApps);

      // Send email
      await sendEmail({
        to: user.email,
        subject: `⏰ Rappel : ${userApps.length} candidature${userApps.length > 1 ? 's' : ''} en cours - Scholar Tracker`,
        html,
        text
      });

      emailsSent++;
      details.push({ email: user.email, appCount: userApps.length });
      console.log(`[Reminders] Successfully sent email to ${user.email} with ${userApps.length} applications.`);
    } catch (err: any) {
      console.error(`[Reminders] Failed to send reminder email to user ID ${userId}:`, err);
      errors.push(`User ${userId}: ${err.message || err}`);
    }
  }

  return {
    success: errors.length === 0,
    emailsSent,
    totalUsersReminded: Object.keys(userAppsMap).length,
    sentTo: details,
    errors: errors.length > 0 ? errors : undefined
  };
}
