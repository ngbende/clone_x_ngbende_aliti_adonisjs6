# Clone X - Plateforme de Réseau Social

Une application web fullstack inspirée de Twitter/X, développée avec AdonisJS 6 + Edge et PostgreSQL.

## 🚀 Technologies Utilisées

- **Backend**: AdonisJS 6 (Node.js)
- **Frontend**: Edge (moteur de template)
- **Base de données**: PostgreSQL
- **Authentification**: Session-based avec hachage scrypt
- **Email**: SendGrid
- **IA**: Intégration Mistral (Grok-like)
- **Styling**: Tailwind CSS (mobile-first)
- **Icônes**: Lucide Icons

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🔧 Installation & Lancement

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd clone-x-adonisjs6
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Copier le fichier `.env.example` vers `.env` et configurer :

```env
# .env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=2VOBYqx6jYBQJTo5bT-HxNz31TS-dhRI
NODE_ENV=development

# Base de données PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=clone_x_adonisjs6

# Email (SendGrid)
MAIL_DRIVER=sendgrid
MAIL_FROM_ADDRESS=votre_email@gmail.com
MAIL_FROM_NAME=Clone_X
SENDGRID_API_KEY=votre_cle_sendgrid

# IA (Mistral/Grok)
MISTRAL_API_KEY=votre_cle_mistral

SEED_DATABASE=true
```

### 4. Exécuter les migrations
```bash
node ace migration:run
```

### 5. Lancer les seeders (données de test)
```bash
node ace db:seed
```

### 6. Démarrer le serveur
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3333`

## 🗃️ Structure de la Base de Données

### Tables Principales

- **users**: Gestion des utilisateurs
- **tweets**: Publication de tweets et réponses
- **likes**: Interactions de likes
- **retweets**: Fonctionnalité de retweet
- **follows**: Système d'abonnements
- **hashtags**: Gestion des hashtags
- **blocks**: Blocage entre utilisateurs
- **follow_requests**: Demandes de suivi pour comptes privés
- **grok_suggestions**: Suggestions d'IA
- **password_reset_tokens**: Réinitialisation de mots de passe

## 🎯 Fonctionnalités Principales

### 👥 Gestion des Utilisateurs
- ✅ Inscription avec email
- ✅ Confirmation par email
- ✅ Connexion sécurisée
- ✅ Réinitialisation de mot de passe
- ✅ Modification du profil (bio, avatar, bannière)
- ✅ Consultation des profils utilisateurs

### 💬 Gestion des Tweets
- ✅ Création de tweets (texte + médias)
- ✅ Suppression de ses propres tweets
- ✅ Réponses aux tweets
- ✅ Affichage des réponses
- ✅ Timeline des tweets suivis

### ❤️ Interactions Sociales
- ✅ Like/Unlike des tweets
- ✅ Retweet des publications
- ✅ Compteurs d'interactions en temps réel

### 🔄 Système de Follow
- ✅ Suivre/Ne plus suivre des utilisateurs
- ✅ Liste des abonnés/abonnements
- ✅ Timeline dynamique basée sur les follows

### 🔍 Recherche
- ✅ Recherche globale dans la plateforme
- ✅ Résultats incluant comptes et tweets

## 🚀 Fonctionnalités Avancées

### 🛡️ Blocage d'Utilisateurs
- Bloquer/débloquer des utilisateurs
- Protection contre les interactions non désirées
- Restriction automatique d'accès

### 🔒 Comptes Privés
- Option de compte privé
- Demandes de suivi pour accéder au contenu
- Gestion des demandes en attente
- Interface de modération des demandes

### #️⃣ Gestion des Hashtags
- Ajout automatique de hashtags
- Navigation par hashtag
- Pages dédiées aux tendances
- Extraction automatique depuis le contenu

### 🤖 Intégration IA (Mistral)
- Génération de contenu assistée par IA
- Suggestions de hashtags intelligents
- Analyse et statistiques des tweets
- Interface dédiée pour l'assistant Grok

## 🏗️ Architecture des Contrôleurs

### 🔐 **AuthenthisController**
Gère l'authentification et la création de comptes :
- Inscription avec vérification par email
- Connexion/déconnexion sécurisée
- Renvoi d'emails de vérification
- Vérification de compte

### 🐦 **GestionTweetsController**
Gère le cycle de vie des tweets :
- Création de tweets avec médias
- Extraction automatique des hashtags
- Système de réponses et threads
- Suppression de tweets

### 💕 **InteractionsTweetsController**
Gère les interactions sociales :
- Like/Unlike de tweets
- Retweet/Unretweet
- Compteurs en temps réel

### 👥 **FollowsController & FollowRequestsController**
Gère les relations sociales :
- Suivi/désabonnement
- Demandes de suivi pour comptes privés
- Acceptation/refus de demandes
- Timeline des utilisateurs suivis

### 🛡️ **BlocksController**
Gère le blocage utilisateur :
- Blocage/déblocage mutuel
- Restriction d'interactions

### 📊 **ProfilesController**
Gère l'affichage des profils :
- Profil utilisateur avec statistiques
- Affichage des tweets, réponses, médias, likes
- Listes d'abonnés/abonnements

### 🔍 **SearchesController**
Gère la recherche globale :
- Recherche dans les utilisateurs et tweets
- Résultats en temps réel

### 🤖 **GrokController**
Intégration IA avec Mistral :
- Génération de contenu de tweet
- Suggestions de hashtags
- Analyse de tweets

### ⚙️ **ModifProfilesController**
Gère la modification du profil :
- Mise à jour des informations personnelles
- Gestion de la confidentialité
- Upload d'avatar et bannière

### 🔑 **PasswordResetsController**
Gère la récupération de compte :
- Demande de réinitialisation
- Envoi d'emails sécurisés
- Réinitialisation du mot de passe

## 🛡️ Middlewares de Sécurité

### **AuthMiddleware**
- Vérification de l'authentification
- Redirection vers la page de connexion si non authentifié

### **CheckBlockedMiddleware**
- Vérification des relations de blocage
- Restriction d'accès aux profils bloqués
- Retour d'erreur 404 personnalisée

### **CheckPrivateAccount**
- Gestion des comptes privés
- Vérification des autorisations d'accès
- Affichage des demandes de suivi en attente

## 🎨 Interface Utilisateur (Edge Templates)

### 📐 **Architecture Complète des Vues**

```
resources/views/
├── layouts/
│   └── app.edge                    # Layout principal authentification
├── pages/
│   ├── auth/                       # Pages d'authentification
│   │   ├── homeAuth.edge           # Landing page publique
│   │   ├── login.edge              # Connexion utilisateur
│   │   ├── signUp.edge             # Inscription nouveau compte
│   │   ├── forgot_password.edge    # Mot de passe oublié
│   │   └── reset_password.edge     # Réinitialisation mot de passe
│   ├── errors/                     # Pages d'erreur
│   │   └── not_founds.edge         # 404 personnalisée (utilisateur bloqué)
│   ├── components/                 # Composants réutilisables
│   │   ├── icones/                 # Bibliothèque d'icônes SVG
│   │   ├── deleteTweet.edge        # Modal de suppression tweet
│   │   ├── logoutModal.edge        # Modal de déconnexion
│   │   └── reponseForm.edge        # Modal de réponse aux tweets
│   └── [pages principales]         # Pages fonctionnelles
│       ├── home.edge               # Timeline principale
│       ├── following.edge          # Timeline abonnements
│       ├── profile.edge            # Profil utilisateur
│       ├── modifProfil.edge        # Modification profil
│       ├── search.edge             # Page de recherche
│       ├── reply.edge              # Thread de tweet
│       ├── hashtag.edge            # Page hashtag
│       ├── grok.edge               # Assistant IA
│       ├── receiveFollows.edge     # Demandes de suivi
│       ├── folowsLists.edge        # Liste followers/followings
│       └── privateAccount.edge     # Compte privé inaccessible
└── partials/                       # Partiels réutilisables
    ├── header.edge                 # Navigation principale
    ├── headerProfile.edge          # Header pages profil
    ├── tweetSection.edge           # Carte tweet (timeline)
    ├── tweetSecProfile.edge        # Carte tweet (profil)
    ├── tweetsFolowing.edge         # Carte tweet (abonnements)
    ├── sectionFolowSearch.edge     # Sidebar suggestions/recherche
    ├── sectionHashtags.edge        # Affichage hashtag
    ├── reponses.edge               # Affichage réponses
    └── followListSections.edge     # Item liste followers
```

### 🎯 **Pages Principales Détailées**

#### **1. Authentification & Accès**
- **`homeAuth.edge`** : Landing page avec call-to-action et navigation vers inscription/connexion
- **`login.edge`** : Formulaire de connexion avec gestion des erreurs et renvoi de vérification email
- **`signUp.edge`** : Formulaire d'inscription complet avec validation en temps réel
- **Pages de récupération** : Flux complet de réinitialisation de mot de passe

#### **2. Interface Principale Authentifiée**

##### **Timeline Générale (`home.edge`)**
- **Header fixe** avec navigation sticky et onglets "Pour vous"/"Abonnements"
- **Section création de tweet** avancée :
  - Upload d'images (5MB max) et vidéos (20MB max)
  - Prévisualisation des médias avant envoi
  - Extraction automatique des hashtags
  - Interface responsive mobile-first
- **Feed dynamique** avec système infini scroll
- **Interactions temps réel** : like, retweet, réponse
- **Layout adaptatif** :
  - Mobile : Navigation bottom-bar
  - Desktop : Navigation latérale + sidebar suggestions

##### **Timeline Abonnements (`following.edge`)**
- Affichage exclusif des tweets des utilisateurs suivis
- Même interface que la timeline générale mais contenu filtré
- Indicateur visuel du statut de follow

#### **3. Gestion des Profils**

##### **Page Profil (`profile.edge`)**
- **Header personnalisé** avec bannière et avatar adaptatifs
- **Onglets multiples** :
  - **Posts** : Tweets originaux et retweets
  - **Réponses** : Conversations et threads
  - **Tweets-marquants** : Contenu avec médias
  - **J'aime** : Tweets likés par l'utilisateur
- **Statistiques complètes** : abonnés, abonnements, date d'inscription
- **Actions contextuelles** :
  - Modification du profil (propre compte)
  - Blocage/déblocage (autres utilisateurs)
  - Follow/demande de suivi

##### **Modification Profil (`modifProfil.edge`)**
- Formulaire complet de modification des informations
- Gestion de la confidentialité (compte privé/public)
- Upload sécurisé d'avatar et bannière
- Changement de mot de passe avec validation

#### **4. Recherche et Découverte**

##### **Page Recherche (`search.edge`)**
- Recherche globale en temps réel
- Résultats segmentés : Utilisateurs et Tweets
- Interface de filtrage intuitive
- Suggestions de recherche contextuelles

##### **Page Hashtag (`hashtag.edge`)**
- Affichage de tous les tweets contenant un hashtag spécifique
- Interface de création de tweet depuis la page
- Navigation fluide entre les différents hashtags

#### **5. Interactions Sociales Avancées**

##### **Thread de Tweet (`reply.edge`)**
- Affichage hiérarchique des conversations
- Tweet parent mis en avant avec toutes ses réponses
- Interface de réponse intégrée avec prévisualisation
- Navigation contextuelle dans les threads

##### **Listes Followers/Followings (`folowsLists.edge`)**
- Affichage des listes d'abonnés et d'abonnements
- Boutons d'action contextuels (suivre/demander/accepter)
- Statuts de follow en temps réel

#### **6. Fonctionnalités Avancées**

##### **Assistant IA Grok (`grok.edge`)**
- Interface dédiée à l'intelligence artificielle
- Trois fonctionnalités principales :
  - **Génération de contenu** : Création de tweets optimisés
  - **Suggestions de hashtags** : Recommandations intelligentes
  - **Analyse de tweets** : Statistiques et conseils
- Intégration transparente avec l'API Mistral

##### **Gestion Comptes Privés**
- **`receiveFollows.edge`** : Interface de modération des demandes de suivi
- **`privateAccount.edge`** : Page d'information pour comptes privés inaccessibles

### 🧩 **Système de Composants Modulaires**

#### **Partiels de Navigation**

**`header.edge`** - Navigation universelle :
- Barre latérale desktop (64px → 256px responsive)
- Barre inférieure mobile optimisée
- Accès rapide aux 8 fonctionnalités principales
- Menu utilisateur avec déconnexion sécurisée

**`headerProfile.edge`** - Navigation profil :
- Version simplifiée pour les pages de profil
- Accès direct aux sections principales
- Design cohérent avec l'expérience utilisateur

#### **Composants Tweet**

**`tweetSection.edge`** - Carte tweet standard :
- Affichage utilisateur avec avatar et informations
- Contenu avec hashtags cliquables et transformation automatique
- Médias intégrés (images/vidéos) avec contrôles
- Interactions complètes (like, retweet, réponse)
- Actions conditionnelles (suppression, blocage)

**Variantes spécialisées :**
- **`tweetSecProfile.edge`** : Optimisé pour les pages profil
- **`tweetsFolowing.edge`** : Adapté à la timeline abonnements
- **`sectionHashtags.edge`** : Spécialisé pour l'affichage hashtag

#### **Composants d'Interaction**

**`reponseForm.edge`** - Modal de réponse :
- Overlay avec fermeture intuitive
- Prévisualisation du tweet parent
- Upload de médias avec preview en temps réel
- Interface accessible et responsive

**`deleteTweet.edge`** - Confirmation suppression :
- Modal de confirmation contextuel
- Affichage du contenu à supprimer
- Actions annuler/confirmer sécurisées

**`logoutModal.edge`** - Déconnexion :
- Prévention des actions accidentelles
- Interface de confirmation claire

#### **Sidebar Dynamique (`sectionFolowSearch.edge`)**
- Barre de recherche globale persistante
- Suggestions d'utilisateurs intelligentes
- Tendances et hashtags populaires
- Footer informatif avec liens légaux

### 📱 **Système de Design Responsive**

#### **Stratégie Mobile-First**
```css
/* Base mobile (par défaut) */
.container { @apply w-full p-4 text-sm }

/* Tablet (≥768px) */
@media (min-width: 768px) {
  .container { @apply md:w-64 md:p-6 md:text-base }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .container { @apply lg:w-80 lg:p-8 lg:text-lg }
}

/* Large screens (≥1280px) */
@media (min-width: 1280px) {
  .container { @apply xl:flex xl:w-96 }
}
```

#### **Points de Rupture Optimisés**
- **Mobile** (< 768px) : Navigation bottom-bar, contenu plein écran
- **Tablet** (768px - 1024px) : Navigation latérale réduite, contenu centré
- **Desktop** (1024px - 1280px) : Layout complet avec sidebar
- **Large** (> 1280px) : Expérience étendue avec toutes les fonctionnalités

#### **Gestion des États Responsive**
- **Navigation** : Transformation fluide mobile/desktop
- **Contenu** : Réorganisation intelligente des éléments
- **Interactions** : Adaptation des tailles de touch targets
- **Médias** : Scaling proportionnel et optimisé

### ✨ **Expérience Utilisateur Avancée**

#### **Interactions Temps Réel**
- **Likes/Retweets** : Mise à jour sans rechargement via Fetch API
- **Compteurs** : Animation fluide des nombres
- **États visuels** : Feedback immédiat sur hover/active
- **Validation** : Messages d'erreur/succès contextuels

#### **Gestion des Médias**
- **Upload sécurisé** : Validation type/taille côté client et serveur
- **Prévisualisation** : Instantanée pour images et vidéos
- **Optimisation** : Compression automatique quand nécessaire
- **Fallbacks** : Messages d'erreur explicites

#### **Performance et Accessibilité**
- **Chargement progressif** : Contenu prioritaire en premier
- **Images optimisées** : Lazy loading et dimensions adaptatives
- **Contrastes** : Palette sombre avec ratios AAA
- **Navigation clavier** : Support complet des raccourcis
- **Labels ARIA** : Description précise des éléments interactifs

#### **Feedback Utilisateur**
- **Messages flash** : Système cohérent succès/erreurs/avertissements
- **États de chargement** : Indicateurs visuels pendant les opérations
- **Confirmations** : Dialogs pour actions destructives
- **Navigation** : Transitions fluides entre les pages

## 🤖 Service d'IA (GrokService)

Le service d'intégration IA utilise l'API Mistral pour :

- **Génération de contenu** : Création de tweets optimisés basés sur des prompts
- **Suggestions de hashtags** : Recommandations intelligentes contextuelles
- **Analyse de tweets** : Statistiques détaillées et conseils d'amélioration

```typescript
// Exemple d'utilisation
const content = await GrokService.ask("Génère un tweet sur le thème : ${prompt}")
const hashtags = await GrokService.ask("Suggestions de hashtags pour : ${text}")
const analysis = await GrokService.ask("Analyse ce tweet : ${text}")
```

## 👥 Utilisateurs de Test

Après exécution des seeders, vous pouvez utiliser ces comptes :

**Utilisateurs Standard:**
- Email: `alice@gmail.com` / Mot de passe: `password123`
- Email: `bob@gmail.com` / Mot de passe: `password123`

**Fonctionnalités de test disponibles :**
- Comptes publics et privés
- Tweets avec médias et hashtags
- Relations de follow établies
- Données de démonstration complètes

## 🌐 Déploiement

L'application est déployée sur Render :
🔗 **Lien de production**: [https://clone-x-ngbende-aliti-adonisjs6.onrender.com](https://clone-x-ngbende-aliti-adonisjs6.onrender.com)

### Variables d'environnement production :
```env
NODE_ENV=production
APP_URL=https://clone-x-ngbende-aliti-adonisjs6.onrender.com
```

## 📁 Structure Complète du Projet

```
app/
├── controllers/              # Contrôleurs MVC (12 contrôleurs)
│   ├── authenthis_controller.ts          # Authentification
│   ├── gestion_tweets_controller.ts      # Cycle de vie tweets
│   ├── interactions_tweets_controller.ts # Likes/Retweets
│   ├── follows_controller.ts             # Système de follow
│   ├── follow_requests_controller.ts     # Demandes de suivi
│   ├── profiles_controller.ts            # Profils utilisateurs
│   ├── searches_controller.ts            # Recherche globale
│   ├── grok_controller.ts               # Intégration IA
│   ├── modif_profiles_controller.ts     # Modification profil
│   ├── password_resets_controller.ts    # Réinitialisation mot de passe
│   ├── blocks_controller.ts             # Gestion blocage
│   └── hashtags_controller.ts           # Gestion hashtags
├── models/                   # Modèles de données (11 modèles)
│   ├── user.ts              # Utilisateur avec relations complètes
│   ├── tweet.ts             # Tweet avec médias et hashtags
│   ├── like.ts              # Interactions like
│   ├── retweet.ts           # Système retweet
│   ├── follow.ts            # Relations de follow
│   ├── follow_request.ts    # Demandes de suivi
│   ├── block.ts             # Relations de blocage
│   ├── hashtag.ts           # Gestion hashtags
│   ├── media.ts             # Médias tweets
│   ├── grok_suggestion.ts   # Suggestions IA
│   └── password_reset_token.ts # Tokens réinitialisation
├── middleware/              # Middlewares personnalisés (3 middlewares)
│   ├── auth_middleware.ts              # Authentification
│   ├── check_blocked_middleware.ts     # Vérification blocage
│   └── check_private_account.ts        # Comptes privés
├── validators/              # Validation des données
│   ├── validation_info.ts              # Inscription
│   ├── tweet.ts                        # Création tweets
│   ├── update_profile.ts               # Modification profil
│   └── password_reset.ts               # Réinitialisation
└── services/               # Services métier
    └── grok_service.ts     # Service d'intégration IA

config/
├── database.ts         # Configuration PostgreSQL
├── auth.ts            # Configuration authentification
├── mail.ts            # Configuration email (SendGrid)
└── bodyparser.ts      # Configuration upload fichiers

database/
├── migrations/         # Migrations de schema (15+ migrations)
├── seeders/           # Données de test
└── factories/         # Factories pour tests

resources/
└── views/             # Templates Edge (20+ templates)
    ├── layouts/       # Layouts principaux
    ├── pages/         # Pages de l'application
    │   ├── auth/      # Authentification (5 pages)
    │   ├── errors/    # Pages d'erreur
    │   └── components/# Composants UI (10+ composants)
    └── partials/      # Partiels réutilisables (10+ partiels)

public/
├── uploads/           # Stockage médias utilisateurs
├── assets/            # Ressources statiques
└── [fichiers publics]
```

## 🔄 Routes Principales

| Méthode | Route | Contrôleur | Action | Description |
|---------|-------|------------|---------|-------------|
| GET | `/` | AuthenthisController | Page d'accueil | Landing page publique |
| POST | `/tweets` | GestionTweetsController | Créer tweet | Création avec médias |
| POST | `/tweets/:id/like` | InteractionsTweetsController | Like/Unlike | Interaction sociale |
| POST | `/follow/:id` | FollowsController | Suivre/Ne plus suivre | Gestion relations |
| GET | `/profile/:id` | ProfilesController | Voir profil | Affichage profil |
| GET | `/search` | SearchesController | Recherche | Recherche globale |
| POST | `/grok/generate` | GrokController | Génération IA | Assistant intelligence artificielle |

## ⚠️ Notes Importantes

### 🔐 **Sécurité**
- Hachage des mots de passe avec scrypt
- Tokens de vérification générés cryptographiquement
- Protection CSRF sur toutes les forms
- Validation robuste côté client et serveur
- Gestion sécurisée des uploads de fichiers

### 🚀 **Performance**
- Chargement eager des relations pour optimisation BDD
- Cache des assets statiques
- Compression des réponses
- Optimisation des requêtes de base de données

### 🛠️ **Développement**
- Architecture MVC stricte
- Séparation claire des responsabilités
- Code réutilisable et maintenable
- Documentation complète

### 📱 **Responsive**
- Interface mobile-first optimisée
- Fallbacks desktop complets
- Support tous les navigateurs modernes
- Accessibilité de niveau AA

## 🐛 Dépannage

### Problèmes courants et solutions :

1. **Erreur de base de données**
   ```bash
   # Vérifier la connexion PostgreSQL
   psql -h localhost -U postgres -d clone_x_adonisjs6
   ```

2. **Emails non envoyés**
   - Vérifier la configuration SendGrid
   - Confirmer l'expéditeur vérifié
   - Vérifier les logs SendGrid

3. **IA non fonctionnelle**
   - Vérifier la clé API Mistral
   - Confirmer les quotas d'API
   - Vérifier la connectivité réseau

4. **Upload de fichiers**
   ```bash
   # Vérifier les permissions
   chmod 755 public/uploads
   ```

5. **Styles non chargés**
   - Vérifier la connexion CDN Tailwind CSS
   - Confirmer les classes utilisées
   - Vérifier la configuration PostCSS

6. **Authentification échoue**
   - Vérifier la configuration de session
   - Confirmer le chiffrement des cookies
   - Vérifier les middlewares d'auth

## 📞 Support

Pour toute question concernant l'installation ou le fonctionnement de l'application :

- **Documentation technique** : Consulter ce README
- **Problèmes techniques** : Ouvrir une issue sur le repository
- **Support utilisateur** : Contacter l'équipe de développement

## 🔮 Améliorations Futures

- [ ] Système de notifications en temps réel
- [ ] Interface de messagerie privée
- [ ] Stories éphémères
- [ ] Analytics avancés pour les tweets
- [ ] Intégration avec d'autres plateformes sociales
- [ ] Mode hors ligne avec synchronisation
- [ ] Thèmes personnalisables

---

**Développé avec ❤️ dans le cadre du projet Kadea-DEV-2025**

*Clone X - Réinventer l'expérience sociale avec AdonisJS 6*
```
