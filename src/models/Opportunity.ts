import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOpportunity extends Document {
  _id: string;
  name: string;
  program?: string;
  type: "Université" | "Bourse";
  country: string;
  city?: string;
  deadline: Date;
  amount?: number;
  website: string;
  notes?: string;
  source: string;
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    name: {
      type: String,
      required: [true, "Opportunity name is required"],
      trim: true,
    },
    program: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Université", "Bourse"],
      default: "Bourse",
      required: true,
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
    amount: {
      type: Number,
      min: 0,
    },
    website: {
      type: String,
      required: [true, "Website is required"],
      trim: true,
    },
    notes: {
      type: String,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OpportunitySchema.index({ deadline: 1 });
OpportunitySchema.index({ country: 1 });
OpportunitySchema.index({ type: 1 });

const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunity>("Opportunity", OpportunitySchema);

export default Opportunity;
