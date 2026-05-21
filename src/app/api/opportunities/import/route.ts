import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Opportunity from "@/models/Opportunity";
import Application from "@/models/Application";

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticateRequest(request);
    await connectDB();

    const { opportunityId } = await request.json();
    if (!opportunityId) {
      return NextResponse.json(
        { error: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    // Find the opportunity in the database
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Check if the user already has an application with this exact name
    const existingApplication = await Application.findOne({
      userId: payload.userId,
      name: opportunity.name,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Vous suivez déjà cette opportunité dans vos candidatures !" },
        { status: 400 }
      );
    }

    // Create the user application based on the opportunity data
    const application = await Application.create({
      userId: payload.userId,
      name: opportunity.name,
      type: opportunity.type,
      program: opportunity.program || "",
      country: opportunity.country,
      city: opportunity.city || "",
      deadline: opportunity.deadline,
      amount: opportunity.amount,
      website: opportunity.website,
      notes: `Opportunité importée.\n\nDescription :\n${opportunity.notes || ""}`,
      status: "En cours",
      statusHistory: [
        {
          status: "En cours",
          date: new Date(),
          note: "Candidature créée par importation d'opportunité",
        },
      ],
    });

    return NextResponse.json(
      { success: true, application },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Import API] Error importing opportunity:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import opportunity" },
      { status: 500 }
    );
  }
}
