# WanderPeek - Plateforme de Réservation d'Hébergements

Application web complète pour la réservation d'hébergements touristiques, développée avec Vite/JavaScript en frontend et Supabase en backend.

## 🚀 Fonctionnalités

### 🏠 Public
- **Page d'accueil** : Liste des hôtels approuvés triés par popularité
- **Filtres** : Recherche par ville et filtres par catégorie
- **Activités** : Découverte des activités touristiques par ville
- **Réservations** : Système de réservation en ligne

### 👨‍💼 Administration
- **Dashboard admin** : Gestion des demandes d'hôtels
- **Validation** : Approbation/rejet des nouvelles propositions
- **Gestion** : CRUD complet sur les hôtels et réservations

### 🏨 Hôteliers
- **Dashboard hôtelier** : Gestion de ses établissements
- **Disponibilités** : Calendrier de disponibilités et tarifs
- **Réservations** : Suivi des réservations reçues

### 👤 Clients
- **Compte personnel** : Gestion du profil utilisateur
- **Historique** : Suivi des réservations passées et futures
- **Réservations** : Création et gestion des demandes

## 🛠️ Technologies

### Frontend
- **Vite** - Build tool et serveur de développement
- **Vanilla JavaScript** - Logique applicative
- **CSS3** - Styles et responsive design
- **HTML5** - Structure sémantique

### Backend
- **Supabase** - Base de données PostgreSQL et authentification
- **Edge Functions** - API serverless pour la logique métier
- **Row Level Security** - Sécurité au niveau des données

## 📦 Installation

### Prérequis
- Node.js 18+
- Compte Supabase

### Configuration

1. **Cloner le projet**
```bash
git clone <repository-url>
cd wanderpeek
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos clés Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Initialiser la base de données**
- Connectez-vous à votre projet Supabase
- Exécutez le script SQL dans `supabase/migrations/create_wanderpeek_schema.sql`

5. **Déployer les Edge Functions**
```bash
# Si vous avez Supabase CLI installé
supabase functions deploy auth
supabase functions deploy hotels
supabase functions deploy admin
supabase functions deploy reservations
supabase functions deploy activities
supabase functions deploy hotelier
```

6. **Lancer l'application**
```bash
npm run dev
```

## 🔐 Comptes de test

### Administrateur
- **Email** : adminwonderpick@gmail.com
- **Mot de passe** : admin0000
- **Rôle** : Gestion complète de la plateforme

### Hôteliers
- **Email** : hotelPark@gmail.com | **Mot de passe** : hotelPark0000
- **Email** : hotelOcean@gmail.com | **Mot de passe** : hotelOcean0000
- **Rôle** : Gestion de leurs établissements

### Clients
- **Email** : client1@test.com, client2@test.com, client3@test.com
- **Mot de passe** : client123
- **Rôle** : Réservation d'hébergements

## 📊 Structure de la base de données

### Tables principales
- **users** - Comptes utilisateurs avec rôles
- **hotels** - Établissements avec statut d'approbation
- **activities** - Activités touristiques par ville
- **reservations** - Réservations avec statuts
- **availabilities** - Calendrier de disponibilités

### Sécurité
- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques d'accès** basées sur les rôles utilisateur
- **Authentification** sécurisée via Supabase Auth

## 🌐 API Endpoints

### Authentification
- `POST /functions/v1/auth/login` - Connexion
- `POST /functions/v1/auth/register` - Inscription

### Hôtels
- `GET /functions/v1/hotels` - Liste des hôtels
- `GET /functions/v1/hotels/{id}` - Détails d'un hôtel
- `POST /functions/v1/hotels/propose` - Proposer un hôtel

### Réservations
- `POST /functions/v1/reservations` - Créer une réservation
- `GET /functions/v1/reservations/client/{id}` - Réservations client
- `GET /functions/v1/reservations/hotel/{id}` - Réservations hôtel

### Administration
- `GET /functions/v1/admin/dashboard` - Tableau de bord
- `PUT /functions/v1/admin/hotels/{id}/approve` - Approuver un hôtel
- `PUT /functions/v1/admin/hotels/{id}/reject` - Rejeter un hôtel

## 🎨 Design

- **Responsive** - Compatible mobile, tablette, desktop
- **Moderne** - Interface utilisateur intuitive
- **Accessible** - Respect des standards d'accessibilité
- **Performance** - Optimisé pour la vitesse

## 🚀 Déploiement

### Frontend
```bash
npm run build
# Déployer le dossier dist/ sur votre hébergeur
```

### Backend
Les Edge Functions sont automatiquement déployées sur Supabase.

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Supabase
- Vérifier les logs des Edge Functions