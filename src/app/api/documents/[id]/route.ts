import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";

const JWT_SECRET = process.env.JWT_SECRET || "votre-secret-jwt-super-securise";

export async function DELETE(
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
        { error: "Non autorisé à supprimer ce document" },
        { status: 403 }
      );
    }

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), "public", document.path);
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting file:", error);
      // Continue même si le fichier n'existe pas
    }

    // Supprimer l'entrée de la base de données
    await Document.findByIdAndDelete(id);

    return NextResponse.json({ message: "Document supprimé avec succès" });
  } catch (error: any) {
    console.error("Error deleting document:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression du document" },
      { status: 500 }
    );
  }
}
