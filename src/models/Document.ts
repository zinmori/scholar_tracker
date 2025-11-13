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
    path: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
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

export default mongoose.models.Document ||
  mongoose.model("Document", documentSchema);
