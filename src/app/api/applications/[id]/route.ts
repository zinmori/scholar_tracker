import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Application from "@/models/Application";

// GET single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);
    const { id } = await params;

    await connectDB();
    const application = await Application.findById(id).populate(
      "userId",
      "name email"
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user owns the application or is admin
    if (
      application.userId._id.toString() !== payload.userId &&
      !isAdmin(payload)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Transform the data
    const appObj = application.toObject();
    const userId = appObj.userId as any; // Populated user object
    const transformedApp = {
      ...appObj,
      id: appObj._id.toString(),
      userId: userId._id.toString(),
      user: {
        id: userId._id.toString(),
        name: userId.name,
        email: userId.email,
      },
      deadline: appObj.deadline.toISOString().split("T")[0],
      submittedDate: appObj.submittedDate
        ? appObj.submittedDate.toISOString().split("T")[0]
        : undefined,
      createdAt: appObj.createdAt.toISOString(),
      updatedAt: appObj.updatedAt.toISOString(),
    };

    return NextResponse.json({ application: transformedApp });
  } catch (error: any) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// PUT update application
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);
    const { id } = await params;

    await connectDB();
    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user owns the application or is admin
    if (application.userId.toString() !== payload.userId && !isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Application.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticateRequest(request);
    const { id } = await params;

    await connectDB();
    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user owns the application or is admin
    if (application.userId.toString() !== payload.userId && !isAdmin(payload)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Application.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete application error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
