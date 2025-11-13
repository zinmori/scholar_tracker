import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Pour la sécurité, on retourne toujours un succès même si l'email n'existe pas
      return NextResponse.json({
        message:
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    }

    // Générer un token aléatoire
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash le token avant de le stocker
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Sauvegarder le token et l'expiration (1 heure)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 heure
    await user.save();

    // Créer l'URL de réinitialisation
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Envoyer l'email
    try {
      const { html, text } = generatePasswordResetEmail(resetUrl, user.name);
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe - Scholar Tracker",
        html,
        text,
      });

      console.log("Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // On continue même si l'email échoue, mais on le log
    }

    return NextResponse.json({
      message:
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { error: "Erreur lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
}
