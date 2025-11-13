export type ApplicationStatus =
  | "En cours"
  | "Soumise"
  | "En révision"
  | "Acceptée"
  | "Refusée"
  | "En attente";

export type ApplicationType = "Université" | "Bourse";

export interface DocumentItem {
  name: string;
  completed: boolean;
  completedDate?: string;
}

export interface StatusHistoryItem {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  type: ApplicationType;
  name: string; // Nom de l'université ou de la bourse
  program?: string; // Programme d'études (pour université)
  country: string;
  city?: string;
  deadline: string; // Date limite
  status: ApplicationStatus;
  submittedDate?: string; // Date de soumission
  amount?: number; // Montant de la bourse
  applicationFee?: number; // Frais de candidature
  website?: string;
  notes?: string;
  documents?: DocumentItem[]; // Liste des documents avec statut
  statusHistory?: StatusHistoryItem[]; // Historique des changements
  createdAt: string;
  updatedAt: string;
  userId?: string; // ID de l'utilisateur propriétaire
  user?: {
    // Informations utilisateur (populated pour les admins)
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  username: string;
  password: string; // En production, utilisez un hash!
}

export type DocumentType =
  | "CV"
  | "Lettre de motivation"
  | "Relevé de notes"
  | "Diplôme"
  | "Passeport"
  | "Photo"
  | "Autre";

export interface Document {
  id: string;
  name: string;
  originalName: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  path: string;
  userId: string;
  applicationId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}
