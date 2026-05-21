import nodemailer from "nodemailer";

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Scholar Tracker" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to,
      subject,
      text: text || "",
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export function generatePasswordResetEmail(resetUrl: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Scholar Tracker</h1>
          <p>Réinitialisation de votre mot de passe</p>
        </div>
        <div class="content">
          <p>Bonjour ${userName},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Scholar Tracker.</p>
          <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
          <p>Pour des raisons de sécurité, le lien ne peut être utilisé qu'une seule fois.</p>
          <div class="footer">
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bonjour ${userName},

Vous avez demandé à réinitialiser votre mot de passe pour votre compte Scholar Tracker.

Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
${resetUrl}

Ce lien est valide pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L'équipe Scholar Tracker
  `;

  return { html, text };
}

export function generateReminderEmail(userName: string, applications: any[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  const appRows = applications.map((app) => {
    const deadlineDate = new Date(app.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let badgeColor = "#059669"; // Vert (Émeraude) par défaut
    if (diffDays <= 3) {
      badgeColor = "#dc2626"; // Rouge (Urgent)
    } else if (diffDays <= 7) {
      badgeColor = "#d97706"; // Ambre (Moyen)
    }

    const daysText = diffDays === 0 
      ? "Aujourd'hui !" 
      : diffDays === 1 
        ? "Demain !" 
        : `Dans ${diffDays} jours`;

    const formattedDate = deadlineDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });

    return `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <h3 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${app.name}</h3>
              ${app.program ? `<p style="margin: 4px 0 0 0; color: #4b5563; font-size: 14px;">${app.program}</p>` : ""}
            </td>
            <td style="text-align: right; vertical-align: top;">
              <span style="display: inline-block; padding: 4px 10px; background-color: ${badgeColor}; color: white; border-radius: 9999px; font-size: 12px; font-weight: bold; white-space: nowrap;">
                ${daysText}
              </span>
            </td>
          </tr>
        </table>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #f3f4f6; font-size: 13px; color: #6b7280;">
          <span style="margin-right: 16px;">📍 <strong>Destination :</strong> ${app.country}${app.city ? `, ${app.city}` : ""}</span>
          <span>📅 <strong>Date limite :</strong> ${formattedDate}</span>
        </div>
      </div>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 0 20px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.025em;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 24px;
        }
        .intro {
          font-size: 16px;
          margin-bottom: 20px;
          color: #111827;
        }
        .button-container {
          text-align: center;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4f46e5;
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
        }
        .footer {
          text-align: center;
          padding: 24px;
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <h1>🎓 Scholar Tracker</h1>
            <p>Rappel quotidien de vos candidatures</p>
          </div>
          <div class="content">
            <p class="intro">Bonjour <strong>${userName}</strong>,</p>
            <p>Voici la liste de vos candidatures en cours qui n'ont pas encore été soumises et dont la date limite approche :</p>
            
            <div style="margin-top: 20px; margin-bottom: 20px;">
              ${appRows}
            </div>

            <p style="margin-top: 20px;">N'oubliez pas de finaliser vos dossiers et de soumettre vos candidatures avant la date limite !</p>
            
            <div class="button-container">
              <a href="${baseUrl}/dashboard" class="button">Accéder à mon tableau de bord</a>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par Scholar Tracker.</p>
          <p>&copy; ${new Date().getFullYear()} Scholar Tracker. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bonjour ${userName},

Voici la liste de vos candidatures en cours qui n'ont pas encore été soumises et dont la date limite approche :

${applications.map((app) => {
  const deadlineDate = new Date(app.deadline);
  const formattedDate = deadlineDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
  return `- ${app.name} (${app.program || 'Sans programme'}): Date limite le ${formattedDate} (Destination: ${app.country})`;
}).join("\n")}

N'oubliez pas de finaliser vos dossiers et de soumettre vos candidatures avant la date limite !

Accédez à votre tableau de bord ici : ${baseUrl}/dashboard

Cordialement,
L'équipe Scholar Tracker
  `;

  return { html, text };
}
