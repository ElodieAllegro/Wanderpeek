/*
  # Ajout des hôtels manquants pour compléter la répartition géographique

  1. Nouveaux hôtels ajoutés
    - Marseille : 1 hôtel supplémentaire (pour avoir 3 au total)
    - Paris : 1 hôtel supplémentaire (pour avoir 2 au total) 
    - Biarritz : Aucun ajout nécessaire (déjà 2)
    - Lyon : Aucun ajout nécessaire (déjà 1)

  2. Répartition finale
    - Marseille (3) : Hôtel du Vieux-Port, Villa des Calanques, Auberge du Panier
    - Paris (2) : Hôtel Montmartre Charme, Appartement Marais Luxury
    - Biarritz (2) : Villa Océan Biarritz, Surf Lodge Biarritz  
    - Lyon (1) : Hôtel Presqu'île Lyon

  3. Statuts variés
    - Hôtels validés et en attente pour tester toutes les fonctionnalités
*/

-- Vérifier et ajouter les hôtels manquants si nécessaire

-- Marseille : Ajouter un 3ème hôtel si pas déjà présent
INSERT INTO hotels (id, name, description, city, address, postal_code, type, rooms, capacity, price_per_night, status, popularity, amenities, contact_name, contact_email, contact_phone, image, owner_id, created_at)
SELECT 
  '10000000-0000-0000-0000-000000000009',
  'Auberge du Panier Marseille',
  'Au cœur du quartier historique du Panier, cette auberge familiale vous plonge dans l''âme marseillaise authentique. Décoration provençale, petit-déjeuner maison avec produits locaux et accueil chaleureux. Parfait pour découvrir la culture locale à prix accessible.',
  'Marseille',
  '15 Rue du Panier',
  '13002',
  'guesthouse',
  12,
  24,
  65.00,
  'valide',
  78,
  '["wifi", "parking", "pets", "breakfast"]',
  'Fatima Benali',
  'contact@aubergepanier.fr',
  '04 91 90 12 34',
  'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  '00000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '2 months'
WHERE NOT EXISTS (
  SELECT 1 FROM hotels WHERE city = 'Marseille' AND name LIKE '%Panier%'
);

-- Paris : Ajouter un 2ème hôtel si pas déjà présent  
INSERT INTO hotels (id, name, description, city, address, postal_code, type, rooms, capacity, price_per_night, status, popularity, amenities, contact_name, contact_email, contact_phone, image, owner_id, created_at)
SELECT
  '10000000-0000-0000-0000-000000000010',
  'Appartement Marais Luxury',
  'Appartement haut de gamme dans le Marais historique, quartier emblématique de Paris. Décoration contemporaine dans un bâtiment du 17ème siècle rénové avec goût. Cuisine équipée, salon spacieux et chambre avec poutres apparentes. Idéal pour un séjour authentique parisien.',
  'Paris',
  '25 Rue des Rosiers',
  '75004',
  'apartment',
  1,
  4,
  150.00,
  'en_attente',
  0,
  '["wifi", "ac", "kitchen", "historic_building"]',
  'Antoine Dubois',
  'contact@maraisapart.fr',
  '01 48 87 65 43',
  'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  '00000000-0000-0000-0000-000000000003',
  NOW() - INTERVAL '1 month'
WHERE NOT EXISTS (
  SELECT 1 FROM hotels WHERE city = 'Paris' AND name LIKE '%Marais%'
);

-- Ajouter des disponibilités pour les nouveaux hôtels validés
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
    
    -- Pour les nouveaux hôtels validés seulement
    FOR hotel_record IN 
        SELECT id, price_per_night 
        FROM hotels 
        WHERE status = 'valide' 
        AND id IN ('10000000-0000-0000-0000-000000000009')
        AND NOT EXISTS (
            SELECT 1 FROM availabilities WHERE hotel_id = hotels.id
        )
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
            
            -- Prix majoré le weekend (+20%)
            price_multiplier := CASE
                WHEN is_weekend THEN 1.2
                WHEN EXTRACT(month FROM current_date_iter) IN (7, 8) THEN 1.15 -- Été
                ELSE 1.0
            END;
            
            -- Calculer le prix final
            final_price := CASE 
                WHEN price_multiplier = 1.0 THEN NULL -- Prix normal
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
                    ELSE NULL
                END,
                NOW()
            );
            
            -- Jour suivant
            current_date_iter := current_date_iter + INTERVAL '1 day';
        END LOOP;
    END LOOP;
END $$;

-- Ajouter quelques activités supplémentaires pour enrichir l'offre
INSERT INTO activities (title, description, city, image, created_at) VALUES
  ('Cours de cuisine provençale',
   'Atelier culinaire pour apprendre à cuisiner les spécialités marseillaises : bouillabaisse, ratatouille, tapenade. Marché aux produits frais le matin, cours de cuisine l''après-midi et dégustation conviviale.',
   'Marseille',
   'https://images.pexels.com/photos/1267438/pexels-photo-1267438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '1 month'),

  ('Visite du Louvre et ses trésors',
   'Visite guidée du musée du Louvre avec un guide expert. Découverte des œuvres majeures : Joconde, Vénus de Milo, Victoire de Samothrace. Accès coupe-file et explications passionnantes sur l''histoire de l''art.',
   'Paris',
   'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
   NOW() - INTERVAL '1 month')
WHERE NOT EXISTS (
  SELECT 1 FROM activities WHERE title LIKE '%cuisine provençale%' OR title LIKE '%Louvre%'
);

-- Mettre à jour les statistiques des hôtels
UPDATE hotels SET updated_at = NOW() WHERE id IN (
  '10000000-0000-0000-0000-000000000009',
  '10000000-0000-0000-0000-000000000010'
);