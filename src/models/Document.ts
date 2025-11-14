import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "CV",
        "Lettre de motivation",
        "Relevé de notes",
        "Diplôme",
        "Passeport",
        "Photo",
        "Autre",
      ],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    // GridFS file ID instead of path
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Documents are independent, not linked to a specific application
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: false,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
documentSchema.index({ userId: 1, type: 1 });
documentSchema.index({ applicationId: 1 });

// Clear any existing model to avoid schema caching issues
if (mongoose.models.Document) {
  delete mongoose.models.Document;
}

export default mongoose.model("Document", documentSchema);
