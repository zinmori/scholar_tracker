import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    if (!isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// POST create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);

    if (!isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { email, password, name, role } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || "user",
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
