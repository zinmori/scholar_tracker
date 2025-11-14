# 🎓 Scholar Tracker

Application Next.js complète pour tracker vos candidatures universitaires et demandes de bourses d'études avec authentification JWT et MongoDB.

## ✨ Fonctionnalités principales

- 📊 **Dashboard interactif** avec statistiques en temps réel
- 🔐 **Authentification sécurisée** JWT + bcrypt avec gestion multi-utilisateurs
- 📝 **Gestion complète** des candidatures (CRUD)
- 🔍 **Filtres avancés** par statut, type, recherche et tri
- ⏰ **Alertes deadlines** avec badges urgents
- 📄 **Documents** - Upload, stockage GridFS et gestion de CV, lettres, diplômes, etc.
- 👥 **Panel admin** pour gérer les utilisateurs
- 📥 **Export** CSV, JSON et PDF
- 🔄 **Mot de passe oublié** avec reset sécurisé par token
- 📱 **Design responsive** mobile et desktop

## 🚀 Installation rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer MongoDB et Email

Créer `.env.local` à la racine (voir `.env.local.example` pour plus de détails) :

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/scholar-tracker?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_ici

# Email SMTP (pour réinitialisation mot de passe)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Générer un JWT secret :**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Configurer Gmail pour SMTP :**

1. Activer la validation en 2 étapes sur votre compte Google
2. Aller sur https://myaccount.google.com/apppasswords
3. Créer un mot de passe d'application pour "Courrier"
4. Utiliser ce mot de passe dans `SMTP_PASS`

### 3. Initialiser la base de données

```bash
npm run seed
```

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🔑 Comptes par défaut

- **Admin** : `admin@scholar.com` / `admin123`
- **User** : `user@scholar.com` / `user123`

## 📁 Structure

```
scholar/
├── src/
│   ├── app/
│   │   ├── api/                      # Routes API (auth, applications, documents, users)
│   │   ├── dashboard/                # Dashboard principal
│   │   ├── documents/                # Gestion des documents
│   │   ├── forgot-password/          # Réinitialisation mot de passe
│   │   ├── admin/users/              # Panel admin
│   │   └── page.tsx                  # Page connexion
│   ├── components/                   # Composants React
│   ├── lib/                          # Utilitaires (mongodb, auth, gridfs, email)
│   ├── models/                       # Modèles Mongoose (User, Application, Document)
│   └── types/                        # Types TypeScript
├── scripts/
│   ├── seed.ts                       # Initialisation BD
│   ├── test-email.js                 # Test configuration SMTP
│   └── migrate-to-gridfs.js          # Migration documents vers GridFS
└── GRIDFS_MIGRATION.md               # Documentation migration GridFS
```

## 🎯 Guide d'utilisation

### Candidatures

- **Ajouter** : Bouton "+ Nouvelle Candidature"
- **Filtrer** : Recherche, statut, type, tri par deadline/nom
- **Modifier** : Clic sur "Modifier" dans la carte
- **Détails** : Clic sur "👁️ Détails" pour vue complète
- **Supprimer** : Clic sur "✕" avec confirmation

### Documents

- Accès via bouton "Mes Documents" dans le header
- **Upload** : Drag & drop ou sélection (max 10MB)
- **Stockage** : GridFS (compatible Vercel, pas de système de fichiers requis)
- **Types** : CV, Lettre, Relevé, Diplôme, Passeport, Photo, Autre
- **Filtres** : Par type et recherche
- **Actions** : Visualiser, télécharger, supprimer
- **Sécurité** : Chaque utilisateur voit uniquement ses documents
- **Migration** : `npm run migrate:gridfs` pour migrer les anciens documents

### Administration

En tant qu'admin :

- Vue sur **toutes les candidatures** avec nom du propriétaire
- **Filtre par utilisateur** dans le dashboard
- Panel `/admin/users` pour gérer les comptes
- Vue sur **tous les documents** avec info utilisateur

### Mot de passe oublié

1. Clic sur "Mot de passe oublié ?" sur la page de connexion
2. Saisir votre email
3. Recevoir le lien de réinitialisation par email
4. Cliquer sur le lien dans l'email (valide 1 heure)
5. Définir un nouveau mot de passe
6. Se reconnecter avec le nouveau mot de passe
7. Se reconnecter

## 🛠️ Scripts

- `npm run dev` - Serveur développement
- `npm run build` - Build production
- `npm start` - Serveur production
- `npm run seed` - Initialiser la BD
- `npm run test:email` - Tester la configuration SMTP
- `npm run migrate:gridfs` - Migrer les documents vers GridFS

## 🔒 Sécurité

- ✅ Mots de passe hashés (bcrypt)
- ✅ JWT avec expiration (7 jours)
- ✅ Token de reset avec expiration (1 heure)
- ✅ Isolation des données par utilisateur
- ✅ Validation serveur avec Mongoose
- ✅ Protection CRUD par authentification

## 🚀 Déploiement Vercel

✅ **Compatible Vercel** : L'application utilise GridFS pour stocker les documents directement dans MongoDB, pas besoin de système de fichiers.

```bash
vercel
```

Configurer les variables d'environnement :

- `MONGODB_URI`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `NEXT_PUBLIC_BASE_URL`

Voir `.env.local.example` et `GRIDFS_MIGRATION.md` pour plus de détails.

## 💻 Technologies

**Frontend** : Next.js 15, TypeScript, Tailwind CSS, Chart.js  
**Backend** : MongoDB Atlas, Mongoose, JWT, bcrypt, Nodemailer  
**Stockage** : GridFS (MongoDB) - Compatible Vercel, serverless-ready  
**Email** : SMTP (Gmail, SendGrid, Outlook, Yahoo supportés)

---
