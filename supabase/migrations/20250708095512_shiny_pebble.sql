/*
  # Base de données de test complète pour Wanderpeek

  1. Utilisateurs
    - 1 administrateur
    - 2 hôteliers avec leurs établissements
    - 3 clients avec historique de réservations

  2. Hôtels
    - 8 hôtels répartis dans 4 villes (Paris, Marseille, Biarritz, Lyon)
    - Mix de statuts : validés, en attente, refusés
    - Données réalistes : prix, descriptions, équipements

  3. Activités
    - 12 activités variées par ville
    - Descriptions détaillées et images

  4. Réservations
    - 6 réservations avec différents statuts
    - Historique passé et futur

  5. Disponibilités
    - Calendrier complet sur 2 mois pour chaque hôtel validé
    - Tarifs weekend et périodes spéciales
*/

-- Supprimer les données existantes pour éviter les conflits
DELETE FROM availabilities;
DELETE FROM reservations;
DELETE FROM activities;
DELETE FROM hotels;
DELETE FROM users;

-- =============================================
-- UTILISATEURS AVEC RÔLES DÉFINIS
-- =============================================

INSERT INTO users (id, email, name, phone, role, created_at) VALUES
  -- Administrateur
  ('00000000-0000-0000-0000-000000000001', 'adminwonderpick@gmail.com', 'Administrateur Wanderpeek', '01 23 45 67 89', 'admin', NOW() - INTERVAL '6 months'),
  
  -- Hôteliers
  ('00000000-0000-0000-0000-000000000002', 'hotelPark@gmail.com', 'Marie Dubois - Gestionnaire Hotel Park', '04 91 55 12 34', 'hotelier', NOW() - INTERVAL '4 months'),
  ('00000000-0000-0000-0000-000000000003', 'hotelOcean@gmail.com', 'Pierre Martin - Gestionnaire Hotel Ocean', '05 59 24 78 90', 'hotelier', NOW() - INTERVAL '3 months'),
  
  -- Clients
  ('00000000-0000-0000-0000-000000000004', 'client1@test.com', 'Sophie Leroy', '06 12 34 56 78', 'client', NOW() - INTERVAL '2 months'),
  ('00000000-0000-0000-0000-000000000005', 'client2@test.com', 'Thomas Moreau', '06 98 76 54 32', 'client', NOW() - INTERVAL '1 month'),
  ('00000000-0000-0000-0000-000000000006', 'client3@test.com', 'Emma Rousseau', '07 11 22 33 44', 'client', NOW() - INTERVAL '3 weeks');

-- =============================================
-- HÔTELS RÉPARTIS DANS 4 VILLES
-- =============================================

INSERT INTO hotels (id, name, description, city, address, postal_code, type, rooms, capacity, price_per_night, status, popularity, amenities, contact_name, contact_email, contact_phone, image, owner_id, created_at) VALUES
  
  -- MARSEILLE (3 hôtels)
  ('10000000-0000-0000-0000-000000000001', 
   'Hôtel du Vieux-Port', 
   'Situé au cœur du Vieux-Port de Marseille, cet hôtel de charme vous offre une vue imprenable sur le port historique. Nos chambres climatisées allient confort moderne et authenticité provençale. À deux pas des restaurants de bouillabaisse et du marché aux poissons.',
   'Marseille', '12 Quai du Port', '13002', 'hotel', 25, 50, 85.00, 'valide', 95,
   '["wifi", "ac", "parking", "restaurant", "bar"]',
   'Marie Dubois', 'contact@hotelvieuxport.fr', '04 91 55 12 34',
   'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 months'),

  ('10000000-0000-0000-0000-000000000002',
   'Villa des Calanques',
   'Nichée entre mer et montagne, cette villa d''exception offre un accès privilégié au Parc National des Calanques. Piscine à débordement, spa privatif et terrasses panoramiques pour un séjour inoubliable. Idéal pour les amoureux de nature et de luxe.',
   'Marseille', '67 Route des Calanques', '13009', 'villa', 8, 16, 180.00, 'valide', 88,
   '["wifi", "pool", "spa", "parking", "pets", "gym"]',
   'Jean Calanque', 'contact@villacalanques.fr', '04 91 73 28 45',
   'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 months'),

  ('10000000-0000-0000-0000-000000000003',
   'Auberge du Panier',
   'Au cœur du quartier historique du Panier, cette auberge familiale vous plonge dans l''âme marseillaise. Décoration authentique, petit-déjeuner maison et accueil chaleureux. Parfait pour découvrir la culture locale à prix doux.',
   'Marseille', '15 Rue du Panier', '13002', 'guesthouse', 12, 24, 65.00, 'en_attente', 0,
   '["wifi", "parking", "pets"]',
   'Fatima Benali', 'contact@aubergepanier.fr', '04 91 90 12 34',
   null, '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 weeks'),

  -- PARIS (2 hôtels)
  ('10000000-0000-0000-0000-000000000004',
   'Hôtel Montmartre Charme',
   'Hôtel de charme au pied de Montmartre, à 5 minutes à pied du Sacré-Cœur. Chambres décorées dans l''esprit bohème du quartier, avec vue sur les toits parisiens. Proche des cabarets, ateliers d''artistes et de la Place du Tertre.',
   'Paris', '18 Rue des Abbesses', '75018', 'hotel', 30, 60, 120.00, 'valide', 92,
   '["wifi", "ac", "restaurant", "bar"]',
   'Sophie Leroy', 'contact@montmartrecharme.fr', '01 42 58 45 67',
   'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 months'),

  ('10000000-0000-0000-0000-000000000005',
   'Appartement Marais Luxury',
   'Appartement haut de gamme dans le Marais historique. Décoration contemporaine dans un bâtiment du 17ème siècle. Cuisine équipée, salon spacieux et chambre avec poutres apparentes. Idéal pour un séjour authentique parisien.',
   'Paris', '25 Rue des Rosiers', '75004', 'apartment', 1, 4, 150.00, 'refuse', 0,
   '["wifi", "ac", "kitchen"]',
   'Antoine Dubois', 'contact@maraisapart.fr', '01 48 87 65 43',
   null, '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 month'),

  -- BIARRITZ (2 hôtels)
  ('10000000-0000-0000-0000-000000000006',
   'Villa Océan Biarritz',
   'Villa de prestige face à l''océan Atlantique, sur la côte basque. Suites avec terrasse privée, accès direct à la plage et vue panoramique sur les vagues. Spa avec soins aux algues marines et restaurant gastronomique.',
   'Biarritz', '45 Avenue de l''Impératrice', '64200', 'villa', 8, 16, 250.00, 'valide', 90,
   '["wifi", "pool", "spa", "parking", "restaurant", "beach_access"]',
   'Pierre Martin', 'contact@villaocean.fr', '05 59 24 78 90',
   'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '4 months'),

  ('10000000-0000-0000-0000-000000000007',
   'Surf Lodge Biarritz',
   'Lodge moderne dédié aux surfeurs et amateurs de sports nautiques, à 50m de la Grande Plage. Ambiance décontractée, location de matériel de surf, cours avec moniteurs diplômés. Bar à smoothies et terrasse face aux vagues.',
   'Biarritz', '23 Avenue de la Plage', '64200', 'other', 15, 30, 95.00, 'en_attente', 0,
   '["wifi", "gym", "parking", "surf_school", "bar"]',
   'Lucas Surf', 'contact@surflodge.fr', '05 59 41 67 89',
   null, '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 weeks'),

  -- LYON (1 hôtel)
  ('10000000-0000-0000-0000-000000000008',
   'Hôtel Presqu''île Lyon',
   'Hôtel moderne au cœur de la Presqu''île lyonnaise, entre Rhône et Saône. Design contemporain, chambres spacieuses avec vue sur la ville. À proximité des bouchons lyonnais, musées et centres commerciaux. Parfait pour affaires et tourisme.',
   'Lyon', '42 Rue de la République', '69002', 'hotel', 45, 90, 110.00, 'valide', 85,
   '["wifi", "ac", "restaurant", "parking", "gym", "business_center"]',
   'Claire Fontaine', 'contact@presquile-lyon.fr', '04 78 42 15 67',
   'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 months');

-- =============================================
-- ACTIVITÉS TOURISTIQUES PAR VILLE
-- =============================================

INSERT INTO activities (title, description, city, image, created_at) VALUES
  
  -- MARSEILLE (4 activités)
  ('Visite des Calanques en bateau',
   'Découvrez les magnifiques calanques de Marseille lors d''une excursion en bateau. Naviguez entre les falaises calcaires et les eaux turquoise de Cassis à Callelongue. Baignade dans des criques secrètes et déjeuner à bord inclus.',
   'Marseille',
   'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '3 months'),

  ('Randonnée au Parc National des Calanques',
   'Parcours de randonnée guidée dans le Parc National des Calanques. Sentiers panoramiques, faune et flore méditerranéennes, points de vue exceptionnels sur la mer. Niveau modéré, prévoir chaussures de marche et eau.',
   'Marseille',
   'https://images.pexels.com/photos/2901215/pexels-photo-2901215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '3 months'),

  ('Dégustation de vins de Provence',
   'Découverte des vignobles provençaux et dégustation de rosés, rouges et blancs locaux. Visite de domaines familiaux, apprentissage des techniques de vinification et accord mets-vins avec spécialités régionales.',
   'Marseille',
   'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '2 months'),

  ('Tour gastronomique du Vieux-Port',
   'Parcours gourmand dans les ruelles du Vieux-Port. Dégustation de bouillabaisse, navettes, pastis et autres spécialités marseillaises. Rencontre avec les artisans locaux et histoire culinaire de la cité phocéenne.',
   'Marseille',
   'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '2 months'),

  -- PARIS (4 activités)
  ('Croisière romantique sur la Seine',
   'Admirez Paris depuis la Seine lors d''une croisière romantique au coucher du soleil. Passage devant Notre-Dame, Tour Eiffel, Louvre et Musée d''Orsay. Dîner gastronomique à bord avec vue panoramique sur les monuments illuminés.',
   'Paris',
   'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '4 months'),

  ('Visite guidée de Montmartre',
   'Découverte du quartier bohème de Montmartre avec guide local. Sacré-Cœur, Place du Tertre, Moulin Rouge, vignes de Montmartre. Anecdotes sur les artistes célèbres et l''histoire du quartier. Dégustation dans une cave à vins.',
   'Paris',
   'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '4 months'),

  ('Atelier pâtisserie française',
   'Cours de pâtisserie avec chef professionnel. Apprentissage des techniques pour réaliser macarons, éclairs et mille-feuilles. Dégustation des créations et remise d''un livret de recettes. Parfait pour les gourmands !',
   'Paris',
   'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '3 months'),

  ('Balade à vélo dans Paris',
   'Circuit à vélo électrique dans Paris avec guide. Champs-Élysées, Trocadéro, Île de la Cité, Marais. Arrêts photos devant les monuments emblématiques et pauses dans des jardins secrets. Vélos et casques fournis.',
   'Paris',
   'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '3 months'),

  -- BIARRITZ (2 activités)
  ('Cours de surf à Biarritz',
   'Initiez-vous au surf sur les célèbres vagues de Biarritz avec nos moniteurs expérimentés. Cours adaptés à tous niveaux, matériel fourni (planche, combinaison). Spot mythique de la Grande Plage, berceau du surf européen.',
   'Biarritz',
   'https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '3 months'),

  ('Découverte de la côte basque',
   'Excursion le long de la côte basque de Biarritz à Saint-Jean-de-Luz. Villages de pêcheurs, architecture basque, pelote basque et gastronomie locale. Visite de marchés traditionnels et dégustation de jambon de Bayonne.',
   'Biarritz',
   'https://images.pexels.com/photos/3061217/pexels-photo-3061217.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '2 months'),

  -- LYON (2 activités)
  ('Tour des bouchons lyonnais',
   'Découverte de la gastronomie lyonnaise dans les authentiques bouchons. Dégustation de quenelles, saucisson, cervelle de canut et autres spécialités. Accompagnement de vins du Beaujolais et Côtes du Rhône.',
   'Lyon',
   'https://images.pexels.com/photos/1267438/pexels-photo-1267438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '2 months'),

  ('Visite du Vieux Lyon Renaissance',
   'Parcours guidé dans le Vieux Lyon, quartier Renaissance classé UNESCO. Traboules secrètes, cours d''honneur, architecture médiévale. Histoire des soyeux et des imprimeurs. Montée en funiculaire à la Basilique de Fourvière.',
   'Lyon',
   'https://images.pexels.com/photos/2017802/pexels-photo-2017802.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '2 months');

-- =============================================
-- RÉSERVATIONS AVEC HISTORIQUE VARIÉ
-- =============================================

INSERT INTO reservations (id, hotel_id, client_id, checkin_date, checkout_date, guests, rooms, total_price, status, message, created_at) VALUES
  
  -- Réservation confirmée à venir (Sophie Leroy)
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', -- Hôtel du Vieux-Port
   '00000000-0000-0000-0000-000000000004', -- Sophie Leroy
   CURRENT_DATE + INTERVAL '5 days',
   CURRENT_DATE + INTERVAL '8 days',
   2, 1, 255.00, 'confirmee',
   'Chambre avec vue sur le port si possible. Nous célébrons notre anniversaire de mariage.',
   NOW() - INTERVAL '2 weeks'),

  -- Réservation en attente (Thomas Moreau)
  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000006', -- Villa Océan Biarritz
   '00000000-0000-0000-0000-000000000005', -- Thomas Moreau
   CURRENT_DATE + INTERVAL '15 days',
   CURRENT_DATE + INTERVAL '20 days',
   4, 2, 1250.00, 'en_attente',
   'Voyage de noces, merci de préparer quelque chose de spécial. Nous aimerions un panier de bienvenue.',
   NOW() - INTERVAL '1 week'),

  -- Réservation terminée (Emma Rousseau)
  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000004', -- Hôtel Montmartre Charme
   '00000000-0000-0000-0000-000000000006', -- Emma Rousseau
   CURRENT_DATE - INTERVAL '10 days',
   CURRENT_DATE - INTERVAL '7 days',
   1, 1, 360.00, 'terminee',
   'Séjour professionnel, facture nécessaire.',
   NOW() - INTERVAL '3 weeks'),

  -- Réservation annulée (Sophie Leroy)
  ('20000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000008', -- Hôtel Presqu'île Lyon
   '00000000-0000-0000-0000-000000000004', -- Sophie Leroy
   CURRENT_DATE - INTERVAL '5 days',
   CURRENT_DATE - INTERVAL '2 days',
   3, 2, 660.00, 'annulee',
   'Réunion de famille annulée pour raisons de santé.',
   NOW() - INTERVAL '1 month'),

  -- Réservation confirmée future (Thomas Moreau)
  ('20000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000002', -- Villa des Calanques
   '00000000-0000-0000-0000-000000000005', -- Thomas Moreau
   CURRENT_DATE + INTERVAL '25 days',
   CURRENT_DATE + INTERVAL '28 days',
   2, 1, 540.00, 'confirmee',
   'Weekend détente avec accès spa. Merci de réserver les soins.',
   NOW() - INTERVAL '3 days'),

  -- Réservation terminée ancienne (Emma Rousseau)
  ('20000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000001', -- Hôtel du Vieux-Port
   '00000000-0000-0000-0000-000000000006', -- Emma Rousseau
   CURRENT_DATE - INTERVAL '45 days',
   CURRENT_DATE - INTERVAL '42 days',
   2, 1, 255.00, 'terminee',
   'Excellent séjour, nous reviendrons !',
   NOW() - INTERVAL '2 months');

-- =============================================
-- DISPONIBILITÉS COMPLÈTES SUR 2 MOIS
-- =============================================

-- Fonction pour générer les disponibilités (approche simplifiée)
-- On va créer des disponibilités pour les 60 prochains jours pour chaque hôtel validé

DO $$
DECLARE
    hotel_record RECORD;
    current_date_iter DATE;
    end_date DATE;
    is_weekend BOOLEAN;
    is_available BOOLEAN;
    price_multiplier DECIMAL;
    final_price DECIMAL;
BEGIN
    -- Date de fin (2 mois à partir d'aujourd'hui)
    end_date := CURRENT_DATE + INTERVAL '2 months';
    
    -- Pour chaque hôtel validé
    FOR hotel_record IN 
        SELECT id, price_per_night 
        FROM hotels 
        WHERE status = 'valide'
    LOOP
        -- Pour chaque jour des 2 prochains mois
        current_date_iter := CURRENT_DATE;
        
        WHILE current_date_iter <= end_date LOOP
            -- Déterminer si c'est un weekend (vendredi, samedi, dimanche)
            is_weekend := EXTRACT(dow FROM current_date_iter) IN (0, 5, 6);
            
            -- 95% de disponibilité en général, 85% le weekend
            is_available := CASE 
                WHEN is_weekend THEN random() < 0.85
                ELSE random() < 0.95
            END;
            
            -- Prix majoré le weekend (+20%) et périodes spéciales
            price_multiplier := CASE
                WHEN is_weekend THEN 1.2
                WHEN EXTRACT(month FROM current_date_iter) IN (7, 8) THEN 1.15 -- Été
                WHEN EXTRACT(month FROM current_date_iter) = 12 AND EXTRACT(day FROM current_date_iter) > 20 THEN 1.3 -- Fêtes de fin d'année
                ELSE 1.0
            END;
            
            -- Calculer le prix final
            final_price := CASE 
                WHEN price_multiplier = 1.0 THEN NULL -- Prix normal, pas de surcharge
                ELSE hotel_record.price_per_night * price_multiplier
            END;
            
            -- Insérer la disponibilité
            INSERT INTO availabilities (hotel_id, date, is_available, price_override, notes, created_at)
            VALUES (
                hotel_record.id,
                current_date_iter,
                is_available,
                final_price,
                CASE 
                    WHEN is_weekend THEN 'Tarif weekend'
                    WHEN EXTRACT(month FROM current_date_iter) IN (7, 8) THEN 'Tarif haute saison'
                    WHEN EXTRACT(month FROM current_date_iter) = 12 AND EXTRACT(day FROM current_date_iter) > 20 THEN 'Tarif fêtes de fin d''année'
                    ELSE NULL
                END,
                NOW()
            );
            
            -- Jour suivant
            current_date_iter := current_date_iter + INTERVAL '1 day';
        END LOOP;
    END LOOP;
END $$;