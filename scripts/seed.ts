import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Define User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@scholar.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      console.log("Email: admin@scholar.com");
      console.log(
        "If you forgot the password, delete this user and run the script again"
      );
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = await User.create({
      email: "admin@scholar.com",
      password: hashedPassword,
      name: "Administrator",
      role: "admin",
    });

    console.log("✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@scholar.com");
    console.log("🔑 Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  IMPORTANT: Change this password after first login!");

    // Create a sample regular user
    const hashedUserPassword = await bcrypt.hash("user123", 10);

    const user = await User.create({
      email: "user@scholar.com",
      password: hashedUserPassword,
      name: "Test User",
      role: "user",
    });

    console.log("\n✅ Sample user created:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: user@scholar.com");
    console.log("🔑 Password: user123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nYou can now run: npm run dev");
  } catch (error: any) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

seedDatabase();
