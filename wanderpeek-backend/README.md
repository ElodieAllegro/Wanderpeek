# Wanderpeek Backend API

Backend Symfony pour l'application Wanderpeek - Plateforme de réservation d'hébergements.

## 🚀 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd wanderpeek-backend

# Installer les dépendances
composer install

# Configurer la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

# Lancer le serveur de développement
symfony server:start
# ou
php -S localhost:8000 -t public/
```

## 🔐 Comptes de test

### Admin
- **Email:** adminwonderpick@gmail.com
- **Mot de passe:** admin0000
- **Rôle:** ROLE_ADMIN

### Hôteliers
- **Email:** hotelPark@gmail.com / **Mot de passe:** hotelPark0000
- **Email:** hotelOcean@gmail.com / **Mot de passe:** hotelOcean0000
- **Rôle:** ROLE_HOTELIER

### Clients
- **Email:** client1@test.com, client2@test.com, client3@test.com
- **Mot de passe:** client123
- **Rôle:** ROLE_USER

## 📡 API Endpoints

### 🏠 Public
- `GET /` - Informations API
- `GET /api/hotels` - Liste des hôtels approuvés
- `GET /api/hotels?city=Marseille` - Hôtels par ville
- `GET /api/hotels?popular=true` - Hôtels populaires
- `GET /api/activities` - Liste des activités
- `GET /api/activities?city=Paris` - Activités par ville
- `GET /api/cities` - Liste des villes disponibles

### 🔐 Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### 🏨 Hôtels
- `POST /api/hotels/propose` - Proposer un nouvel hôtel
- `GET /api/hotels/{id}` - Détails d'un hôtel

### 📅 Réservations
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations/client/{clientId}` - Réservations d'un client
- `GET /api/reservations/hotel/{hotelId}` - Réservations d'un hôtel
- `PUT /api/reservations/{id}/status` - Modifier le statut d'une réservation

### 👨‍💼 Admin (ROLE_ADMIN)
- `GET /api/admin/dashboard` - Tableau de bord admin
- `GET /api/admin/hotels/pending` - Hôtels en attente
- `GET /api/admin/hotels` - Tous les hôtels
- `PUT /api/admin/hotels/{id}/approve` - Approuver un hôtel
- `PUT /api/admin/hotels/{id}/reject` - Rejeter un hôtel
- `DELETE /api/admin/hotels/{id}` - Supprimer un hôtel

### 🏨 Hôtelier (ROLE_HOTELIER)
- `GET /api/hotelier/dashboard/{userId}` - Tableau de bord hôtelier
- `GET /api/hotelier/hotels/{hotelId}/availability` - Disponibilités d'un hôtel
- `POST /api/hotelier/hotels/{hotelId}/availability` - Mettre à jour les disponibilités

## 🗄️ Structure de la base de données

### Entités principales
- **User** - Utilisateurs (admin, hôteliers, clients)
- **Hotel** - Hébergements
- **Activity** - Activités touristiques
- **Reservation** - Réservations
- **Availability** - Disponibilités des hôtels

### Statuts
- **Hotel:** `en_attente`, `valide`, `refuse`
- **Reservation:** `en_attente`, `confirmee`, `annulee`, `terminee`

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"
APP_SECRET=your-secret-key-here
```

### Sécurité
- Authentification par email/mot de passe
- Hachage des mots de passe avec bcrypt
- Contrôle d'accès basé sur les rôles
- API REST stateless

## 🧪 Données de test

Le projet inclut des fixtures avec :
- 1 administrateur
- 2 hôteliers avec leurs hôtels
- 3 clients avec des réservations
- 5 hôtels dans 3 villes (Marseille, Paris, Biarritz)
- 4 activités touristiques
- Disponibilités sur 2 mois pour chaque hôtel

## 🚀 Déploiement

Pour la production :
1. Configurer une vraie base de données (MySQL/PostgreSQL)
2. Implémenter l'authentification JWT
3. Configurer HTTPS
4. Optimiser les performances avec un cache Redis
5. Ajouter la gestion des fichiers/images

## 📱 Intégration Front-end

L'API est conçue pour s'intégrer facilement avec le front-end JavaScript existant :
- Réponses JSON standardisées
- Codes de statut HTTP appropriés
- CORS configuré pour le développement
- Structure compatible avec l'interface actuelle

## 🛠️ Technologies utilisées

- **PHP 8.1+**
- **Symfony 6.4**
- **Doctrine ORM**
- **API Platform**
- **SQLite** (développement)
- **Fixtures** pour les données de test