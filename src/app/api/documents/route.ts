import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { uploadToGridFS } from "@/lib/gridfs";

const JWT_SECRET = process.env.JWT_SECRET || "votre-secret-jwt-super-securise";

// GET - Récupérer les documents
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    await connectDB();

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const type = searchParams.get("type");

    let query: any = {};

    // Les admins voient tout, les users seulement leurs documents
    if (decoded.role !== "admin") {
      query.userId = decoded.userId;
    }

    if (applicationId) {
      query.applicationId = applicationId;
    }

    if (type && type !== "Tous") {
      query.type = type;
    }

    const documents = await Document.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Transformer les données
    const transformedDocs = documents.map((doc: any) => {
      const docObj = doc.toObject();
      return {
        ...docObj,
        id: docObj._id.toString(),
        userId: docObj.userId._id.toString(),
        user: {
          id: docObj.userId._id.toString(),
          name: docObj.userId.name,
          email: docObj.userId.email,
        },
        applicationId: docObj.applicationId?.toString() || null,
        createdAt: docObj.createdAt.toISOString(),
        updatedAt: docObj.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ documents: transformedDocs });
  } catch (error: any) {
    console.error("Error fetching documents:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des documents" },
      { status: 500 }
    );
  }
}

// POST - Uploader un document
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const description = (formData.get("description") as string) || "";
    const applicationId = (formData.get("applicationId") as string) || null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "Type de document requis" },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10MB)" },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload vers GridFS
    const fileId = await uploadToGridFS(buffer, fileName, {
      originalName: file.name,
      mimeType: file.type,
      userId: decoded.userId,
      type,
      applicationId: applicationId || undefined,
      description,
    });

    // Créer l'entrée dans la base de données
    const document = await Document.create({
      name: fileName,
      originalName: file.name,
      type,
      mimeType: file.type,
      size: file.size,
      fileId,
      userId: decoded.userId,
      applicationId: applicationId || null,
      description,
    });

    const docObj = document.toObject();

    return NextResponse.json({
      document: {
        ...docObj,
        id: docObj._id.toString(),
        userId: docObj.userId.toString(),
        applicationId: docObj.applicationId?.toString() || null,
        createdAt: docObj.createdAt.toISOString(),
        updatedAt: docObj.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error uploading document:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erreur lors de l'upload du document" },
      { status: 500 }
    );
  }
}
