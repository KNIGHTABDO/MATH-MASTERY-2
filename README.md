# Math Mastery Platform

Une plateforme d'apprentissage complète pour les étudiants de 2 BAC Sciences Mathématiques au Maroc.

## Fonctionnalités

### Pour les Étudiants
- 🔐 Authentification sécurisée (inscription/connexion)
- 📚 Accès aux chapitres organisés par ordre logique
- 📖 Leçons détaillées avec support LaTeX pour les formules mathématiques
- 💪 Exercices progressifs avec différents niveaux de difficulté
- 📊 Suivi de progression personnalisé

### Pour les Administrateurs
- 🛠️ Interface d'administration complète
- ➕ Création et modification de chapitres
- 📝 Gestion des leçons avec éditeur LaTeX intégré
- 🎯 Création d'exercices avec énoncés et solutions LaTeX
- 👁️ Aperçu en temps réel du rendu LaTeX
- 🗂️ Organisation par ordre et difficulté

## Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentification**: Supabase Auth
- **Base de données**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **LaTeX**: KaTeX + react-katex
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Installation et Configuration

### 1. Cloner le projet
```bash
git clone <repository-url>
cd math-mastery-platform
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### Base de données
1. Connectez-vous à votre dashboard Supabase
2. Allez dans l'onglet "SQL Editor"
3. Copiez et exécutez le contenu du fichier `database_schema.sql`

#### Variables d'environnement
Les variables sont déjà configurées dans `.env`:
```env
VITE_SUPABASE_URL=https://ywkmaugpexctvftayonw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3a21hdWdwZXhjdHZmdGF5b253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTY1NzEsImV4cCI6MjA2OTAzMjU3MX0.BZFF15-jpV7_Xcw6-SlHcxzzFA7AtrGqGMSbxaz3x6I
```

### 4. Lancer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   └── ProtectedRoute.tsx
├── contexts/           # Contextes React (Auth, etc.)
│   └── AuthContext.tsx
├── pages/              # Pages principales
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   └── Admin.tsx
├── types/              # Types TypeScript
│   └── index.ts
├── utils/              # Utilitaires
│   └── supabase.ts
└── App.tsx            # Composant principal avec routing
```

## Utilisation

### Création d'un compte administrateur

1. Créez un compte normal via l'interface
2. Dans Supabase, allez dans "Authentication" > "Users"
3. Trouvez votre utilisateur et cliquez sur les "..."
4. Modifiez les "User Metadata" pour ajouter:
```json
{
  "role": "admin"
}
```

### Gestion du contenu LaTeX

#### Formules en ligne
Utilisez `$...$` pour les formules en ligne:
```
La dérivée de $f(x) = x^2$ est $f'(x) = 2x$
```

#### Formules en bloc
Utilisez `$$...$$` pour les formules centrées:
```
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
```

#### Exemples LaTeX courants
- Fractions: `\frac{a}{b}`
- Racines: `\sqrt{x}` ou `\sqrt[n]{x}`
- Limites: `\lim_{x \to \infty}`
- Intégrales: `\int_{a}^{b} f(x) dx`
- Sommes: `\sum_{i=1}^{n} i`
- Matrices: `\begin{pmatrix} a & b \\ c & d \end{pmatrix}`

## Fonctionnalités à venir

- 💬 Système de commentaires sur les leçons
- 📈 Analytics détaillés pour les administrateurs
- 🏆 Système de badges et récompenses
- 📱 Application mobile
- 🔍 Recherche avancée dans le contenu
- 📊 Tableaux de bord de progression
- 🎯 Examens blancs chronométrés
- 👥 Forums de discussion entre étudiants

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Support

Pour toute question ou problème, contactez l'équipe de développement.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Math Mastery** - Votre succès en mathématiques 🚀