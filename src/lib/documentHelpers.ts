/**
 * Génère l'URL de téléchargement d'un document depuis GridFS
 */
export function getDocumentDownloadUrl(documentId: string): string {
  return `/api/documents/${documentId}/download`;
}

/**
 * Télécharge un document avec authentification
 */
export async function downloadDocument(
  documentId: string,
  originalName: string
): Promise<void> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Non authentifié");
    }

    const response = await fetch(`/api/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement");
    }

    // Créer un blob à partir de la réponse
    const blob = await response.blob();

    // Créer un lien temporaire pour télécharger le fichier
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName;
    document.body.appendChild(a);
    a.click();

    // Nettoyer
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading document:", error);
    throw error;
  }
}

/**
 * Ouvre un document dans un nouvel onglet avec authentification
 */
export async function viewDocument(documentId: string): Promise<void> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Non authentifié");
    }

    const response = await fetch(`/api/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'affichage");
    }

    // Créer un blob à partir de la réponse
    const blob = await response.blob();

    // Créer une URL temporaire et ouvrir dans un nouvel onglet
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Note: On ne peut pas nettoyer immédiatement car le nouvel onglet a besoin de l'URL
    // Le navigateur nettoiera automatiquement après fermeture de l'onglet
  } catch (error) {
    console.error("Error viewing document:", error);
    throw error;
  }
}
