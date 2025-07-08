/*
  # WanderPeek Database Schema

  1. New Tables
    - `users` - User accounts with roles (admin, hotelier, client)
    - `hotels` - Hotel listings with approval workflow
    - `activities` - Tourist activities by city
    - `reservations` - Booking system
    - `availabilities` - Hotel availability calendar

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Secure data isolation

  3. Sample Data
    - Admin and test accounts
    - Sample hotels and activities
    - Test reservations and availabilities
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'hotelier', 'client');
CREATE TYPE hotel_status AS ENUM ('en_attente', 'valide', 'refuse');
CREATE TYPE reservation_status AS ENUM ('en_attente', 'confirmee', 'annulee', 'terminee');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role user_role NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal_code text NOT NULL,
  type text NOT NULL,
  rooms integer NOT NULL CHECK (rooms > 0),
  capacity integer NOT NULL CHECK (capacity > 0),
  price_per_night decimal(8,2) NOT NULL CHECK (price_per_night > 0),
  status hotel_status NOT NULL DEFAULT 'en_attente',
  popularity integer DEFAULT 0,
  amenities jsonb DEFAULT '[]'::jsonb,
  contact_name text,
  contact_email text,
  contact_phone text,
  website text,
  additional_info text,
  image text,
  owner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  city text NOT NULL,
  image text,
  created_at timestamptz DEFAULT now()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date date NOT NULL,
  checkout_date date NOT NULL,
  guests integer NOT NULL CHECK (guests > 0),
  rooms integer NOT NULL CHECK (rooms > 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price > 0),
  status reservation_status NOT NULL DEFAULT 'en_attente',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (checkout_date > checkin_date)
);

-- Availabilities table
CREATE TABLE IF NOT EXISTS availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  price_override decimal(8,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, date)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can create user" ON users
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Hotels policies
CREATE POLICY "Anyone can read approved hotels" ON hotels
  FOR SELECT TO anon, authenticated
  USING (status = 'valide');

CREATE POLICY "Hoteliers can read own hotels" ON hotels
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Anyone can propose hotels" ON hotels
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Hoteliers can update own hotels" ON hotels
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

-- Activities policies
CREATE POLICY "Anyone can read activities" ON activities
  FOR SELECT TO anon, authenticated
  USING (true);

-- Reservations policies
CREATE POLICY "Clients can read own reservations" ON reservations
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Hoteliers can read hotel reservations" ON reservations
  FOR SELECT TO authenticated
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create reservations" ON reservations
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Hoteliers can update hotel reservations" ON reservations
  FOR UPDATE TO authenticated
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE owner_id = auth.uid()
    )
  );

-- Availabilities policies
CREATE POLICY "Anyone can read availabilities" ON availabilities
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Hoteliers can manage hotel availabilities" ON availabilities
  FOR ALL TO authenticated
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE owner_id = auth.uid()
    )
  );

-- Insert sample data
INSERT INTO users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'adminwonderpick@gmail.com', 'Administrateur Wanderpeek', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'hotelPark@gmail.com', 'Gestionnaire Hotel Park', 'hotelier'),
  ('00000000-0000-0000-0000-000000000003', 'hotelOcean@gmail.com', 'Gestionnaire Hotel Ocean', 'hotelier'),
  ('00000000-0000-0000-0000-000000000004', 'client1@test.com', 'Client Test 1', 'client'),
  ('00000000-0000-0000-0000-000000000005', 'client2@test.com', 'Client Test 2', 'client'),
  ('00000000-0000-0000-0000-000000000006', 'client3@test.com', 'Client Test 3', 'client');

INSERT INTO hotels (id, name, description, city, address, postal_code, type, rooms, capacity, price_per_night, status, popularity, amenities, contact_name, contact_email, contact_phone, image, owner_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Hôtel du Vieux-Port', 'Situé au cœur du Vieux-Port de Marseille, cet hôtel charme par son emplacement exceptionnel et ses chambres confortables avec vue sur le port.', 'Marseille', '12 Quai du Port', '13002', 'hotel', 25, 50, 85.00, 'valide', 95, '["wifi", "ac", "parking"]', 'Marie Dubois', 'contact@hotelvieuxport.fr', '04 91 55 12 34', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000002', 'Villa Océan Biarritz', 'Villa de luxe face à l''océan Atlantique, parfaite pour des vacances romantiques ou en famille.', 'Biarritz', '45 Avenue de l''Impératrice', '64200', 'villa', 8, 16, 250.00, 'valide', 88, '["wifi", "pool", "spa", "parking"]', 'Pierre Martin', 'contact@villaocean.fr', '05 59 24 78 90', 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000003', 'Hôtel Montmartre Charme', 'Hôtel de charme au pied de Montmartre, proche du Sacré-Cœur et des artistes de la Place du Tertre.', 'Paris', '18 Rue des Abbesses', '75018', 'hotel', 30, 60, 120.00, 'valide', 92, '["wifi", "ac", "restaurant"]', 'Sophie Leroy', 'contact@montmartrecharme.fr', '01 42 58 45 67', 'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000004', 'Auberge des Calanques', 'Auberge familiale proche du Parc National des Calanques, idéale pour les amoureux de la nature.', 'Marseille', '67 Route des Calanques', '13009', 'guesthouse', 12, 24, 65.00, 'en_attente', 0, '["wifi", "parking", "pets"]', 'Jean Calanque', 'contact@aubergecalanques.fr', '04 91 73 28 45', null, '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000005', 'Surf Lodge Biarritz', 'Lodge moderne pour surfeurs et amateurs de sports nautiques, à 50m de la plage.', 'Biarritz', '23 Avenue de la Plage', '64200', 'other', 15, 30, 95.00, 'en_attente', 0, '["wifi", "gym", "parking"]', 'Lucas Surf', 'contact@surflodge.fr', '05 59 41 67 89', null, '00000000-0000-0000-0000-000000000002');

INSERT INTO activities (title, description, city, image) VALUES
  ('Visite des Calanques', 'Découvrez les magnifiques calanques de Marseille en bateau ou à pied. Paysages à couper le souffle garantis !', 'Marseille', 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'),
  ('Surf à Biarritz', 'Initiez-vous au surf sur les célèbres vagues de Biarritz avec nos moniteurs expérimentés.', 'Biarritz', 'https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'),
  ('Croisière sur la Seine', 'Admirez Paris depuis la Seine lors d''une croisière romantique au coucher du soleil.', 'Paris', 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'),
  ('Dégustation de vins', 'Découvrez les vins de Provence lors d''une dégustation dans les vignobles marseillais.', 'Marseille', 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop');

INSERT INTO reservations (hotel_id, client_id, checkin_date, checkout_date, guests, rooms, total_price, status, message) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '8 days', 2, 1, 255.00, 'confirmee', 'Chambre avec vue sur le port si possible'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '20 days', 4, 2, 1250.00, 'en_attente', 'Voyage de noces, merci de préparer quelque chose de spécial'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '7 days', 1, 1, 360.00, 'terminee', null);

-- Generate availabilities for the next 2 months for approved hotels
-- First, create a temporary table with date series
WITH date_series AS (
  SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '2 months', '1 day'::interval)::date AS availability_date
),
hotel_dates AS (
  SELECT 
    h.id as hotel_id,
    h.price_per_night,
    ds.availability_date,
    EXTRACT(dow FROM ds.availability_date) as day_of_week
  FROM hotels h
  CROSS JOIN date_series ds
  WHERE h.status = 'valide'
)
INSERT INTO availabilities (hotel_id, date, is_available, price_override)
SELECT 
  hd.hotel_id,
  hd.availability_date,
  CASE WHEN random() > 0.1 THEN true ELSE false END, -- 90% availability
  CASE WHEN hd.day_of_week IN (0,6) THEN hd.price_per_night * 1.2 ELSE null END -- Weekend premium
FROM hotel_dates hd;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_popularity ON hotels(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel ON reservations(hotel_id);
CREATE INDEX IF NOT EXISTS idx_availabilities_hotel_date ON availabilities(hotel_id, date);