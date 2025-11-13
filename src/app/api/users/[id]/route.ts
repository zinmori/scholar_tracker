import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Application from "@/models/Application";

// GET single user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);

    if (!isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);

    if (!isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { email, name, role, password } = await request.json();

    // Find user first
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update fields
    if (email) user.email = email;
    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = password; // Will be hashed by pre-save hook

    // Save will trigger the pre-save hook to hash password
    await user.save();

    // Return user without password
    const userResponse = user.toObject();

    return NextResponse.json({
      success: true,
      user: { ...userResponse, password: "" },
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);

    if (!isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    // Prevent deleting self
    if (payload.userId === id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all user's applications
    await Application.deleteMany({ userId: id });

    return NextResponse.json({
      success: true,
      message: "User and all associated applications deleted",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
