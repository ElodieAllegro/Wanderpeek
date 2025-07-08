/*
  # Création de la table hotel_images

  1. Nouvelle table
    - `hotel_images`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, foreign key vers hotels)
      - `image_url` (text, URL de l'image)
      - `alt_text` (text, texte alternatif pour l'accessibilité)
      - `display_order` (integer, ordre d'affichage)
      - `is_primary` (boolean, image principale)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `hotel_images` table
    - Add policy pour que tout le monde puisse lire les images des hôtels validés
    - Add policy pour que les hôteliers puissent gérer les images de leurs hôtels
    - Add policy pour que les admins puissent gérer toutes les images

  3. Index
    - Index sur hotel_id pour optimiser les requêtes
    - Index sur is_primary pour trouver rapidement l'image principale
*/

-- Créer la table hotel_images
CREATE TABLE IF NOT EXISTS hotel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE hotel_images ENABLE ROW LEVEL SECURITY;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_hotel_images_hotel_id ON hotel_images(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_images_primary ON hotel_images(hotel_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_hotel_images_order ON hotel_images(hotel_id, display_order);

-- Politiques RLS
-- Tout le monde peut lire les images des hôtels validés
CREATE POLICY "Anyone can read images of approved hotels"
  ON hotel_images
  FOR SELECT
  TO anon, authenticated
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE status = 'valide'
    )
  );

-- Les hôteliers peuvent gérer les images de leurs hôtels
CREATE POLICY "Hoteliers can manage their hotel images"
  ON hotel_images
  FOR ALL
  TO authenticated
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    hotel_id IN (
      SELECT id FROM hotels WHERE owner_id = auth.uid()
    )
  );

-- Les admins peuvent gérer toutes les images
CREATE POLICY "Admins can manage all hotel images"
  ON hotel_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Fonction pour s'assurer qu'il n'y a qu'une seule image principale par hôtel
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Si on définit une image comme principale
  IF NEW.is_primary = true THEN
    -- Désactiver toutes les autres images principales pour cet hôtel
    UPDATE hotel_images 
    SET is_primary = false 
    WHERE hotel_id = NEW.hotel_id 
    AND id != NEW.id 
    AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appliquer la fonction
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON hotel_images;
CREATE TRIGGER trigger_ensure_single_primary_image
  BEFORE INSERT OR UPDATE ON hotel_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_image();

-- Migrer les images existantes de la table hotels vers hotel_images
DO $$
DECLARE
  hotel_record RECORD;
BEGIN
  FOR hotel_record IN 
    SELECT id, image 
    FROM hotels 
    WHERE image IS NOT NULL AND image != ''
  LOOP
    INSERT INTO hotel_images (hotel_id, image_url, is_primary, display_order)
    VALUES (hotel_record.id, hotel_record.image, true, 0)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;