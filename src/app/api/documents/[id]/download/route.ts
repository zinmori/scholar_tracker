import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { downloadFromGridFS } from "@/lib/gridfs";

const JWT_SECRET = process.env.JWT_SECRET || "votre-secret-jwt-super-securise";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    await connectDB();

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (
      document.userId.toString() !== decoded.userId &&
      decoded.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Non autorisé à accéder à ce document" },
        { status: 403 }
      );
    }

    // Télécharger le fichier depuis GridFS
    const buffer = await downloadFromGridFS(document.fileId);

    // Retourner le fichier avec les bons headers
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          document.originalName
        )}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error downloading document:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors du téléchargement du document" },
      { status: 500 }
    );
  }
}
