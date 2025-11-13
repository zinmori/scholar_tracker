import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";

// GET all applications (user sees only their own, admin sees all)
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    await connectDB();

    let applications;

    if (isAdmin(payload)) {
      // Admin sees all applications with user info
      const apps = await Application.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      // Transform the data to match frontend expectations
      applications = apps.map((app: any) => {
        const appObj = app.toObject();
        return {
          ...appObj,
          id: appObj._id.toString(),
          userId: appObj.userId._id.toString(),
          user: {
            id: appObj.userId._id.toString(),
            name: appObj.userId.name,
            email: appObj.userId.email,
          },
          deadline: appObj.deadline.toISOString().split("T")[0],
          submittedDate: appObj.submittedDate
            ? appObj.submittedDate.toISOString().split("T")[0]
            : undefined,
          createdAt: appObj.createdAt.toISOString(),
          updatedAt: appObj.updatedAt.toISOString(),
        };
      });
    } else {
      // Regular user sees only their applications
      const apps = await Application.find({ userId: payload.userId }).sort({
        createdAt: -1,
      });

      applications = apps.map((app: any) => {
        const appObj = app.toObject();
        return {
          ...appObj,
          id: appObj._id.toString(),
          userId: appObj.userId.toString(),
          deadline: appObj.deadline.toISOString().split("T")[0],
          submittedDate: appObj.submittedDate
            ? appObj.submittedDate.toISOString().split("T")[0]
            : undefined,
          createdAt: appObj.createdAt.toISOString(),
          updatedAt: appObj.updatedAt.toISOString(),
        };
      });
    }

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    await connectDB();

    const body = await request.json();

    // Create application
    const application = await Application.create({
      ...body,
      userId: payload.userId,
      statusHistory: [
        {
          status: body.status || "En cours",
          date: new Date(),
          note: "Candidature créée",
        },
      ],
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error: any) {
    console.error("Create application error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create application" },
      { status: 500 }
    );
  }
}
