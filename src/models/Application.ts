import mongoose, { Schema, Document, Model } from "mongoose";
import {
  ApplicationStatus,
  ApplicationType,
  DocumentItem,
  StatusHistoryItem,
} from "@/types";

export interface IApplication extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: ApplicationType;
  program?: string;
  country: string;
  city?: string;
  deadline: Date;
  status: ApplicationStatus;
  submittedDate?: Date;
  amount?: number;
  applicationFee?: number;
  website?: string;
  notes?: string;
  documents: DocumentItem[];
  statusHistory: StatusHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Application name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Université", "Bourse"],
      required: true,
    },
    program: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    status: {
      type: String,
      enum: [
        "En cours",
        "Soumise",
        "En révision",
        "Acceptée",
        "Refusée",
        "En attente",
      ],
      default: "En cours",
    },
    submittedDate: {
      type: Date,
    },
    amount: {
      type: Number,
      min: 0,
    },
    applicationFee: {
      type: Number,
      min: 0,
    },
    website: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    documents: [
      {
        name: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedDate: { type: Date },
      },
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, required: true },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, deadline: 1 });

const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
