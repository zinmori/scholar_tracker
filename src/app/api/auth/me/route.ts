import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    await connectDB();

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    await connectDB();

    const { name, preferences } = await request.json();
    const user = await User.findById(payload.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name !== undefined) user.name = name;
    if (preferences !== undefined) {
      user.preferences = {
        studyLevel: preferences.studyLevel !== undefined ? preferences.studyLevel : user.preferences?.studyLevel || "",
        studyField: preferences.studyField !== undefined ? preferences.studyField : user.preferences?.studyField || "",
        targetCountries: preferences.targetCountries !== undefined ? preferences.targetCountries : user.preferences?.targetCountries || [],
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
