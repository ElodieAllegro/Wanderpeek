<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Hotel;
use App\Entity\Activity;
use App\Entity\Reservation;
use App\Entity\Availability;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Créer les utilisateurs
        $users = $this->createUsers($manager);
        
        // Créer les hôtels
        $hotels = $this->createHotels($manager, $users);
        
        // Créer les activités
        $this->createActivities($manager);
        
        // Créer les réservations
        $this->createReservations($manager, $users, $hotels);
        
        // Créer les disponibilités
        $this->createAvailabilities($manager, $hotels);

        $manager->flush();
    }

    private function createUsers(ObjectManager $manager): array
    {
        $users = [];

        // Admin
        $admin = new User();
        $admin->setEmail('adminwonderpick@gmail.com');
        $admin->setName('Administrateur Wanderpeek');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin0000'));
        $manager->persist($admin);
        $users['admin'] = $admin;

        // Hôteliers
        $hotelier1 = new User();
        $hotelier1->setEmail('hotelPark@gmail.com');
        $hotelier1->setName('Gestionnaire Hotel Park');
        $hotelier1->setPhone('01 23 45 67 89');
        $hotelier1->setRoles(['ROLE_HOTELIER']);
        $hotelier1->setPassword($this->passwordHasher->hashPassword($hotelier1, 'hotelPark0000'));
        $manager->persist($hotelier1);
        $users['hotelier1'] = $hotelier1;

        $hotelier2 = new User();
        $hotelier2->setEmail('hotelOcean@gmail.com');
        $hotelier2->setName('Gestionnaire Hotel Ocean');
        $hotelier2->setPhone('01 98 76 54 32');
        $hotelier2->setRoles(['ROLE_HOTELIER']);
        $hotelier2->setPassword($this->passwordHasher->hashPassword($hotelier2, 'hotelOcean0000'));
        $manager->persist($hotelier2);
        $users['hotelier2'] = $hotelier2;

        // Clients
        for ($i = 1; $i <= 3; $i++) {
            $client = new User();
            $client->setEmail("client{$i}@test.com");
            $client->setName("Client Test {$i}");
            $client->setPhone("06 12 34 56 7{$i}");
            $client->setRoles(['ROLE_USER']);
            $client->setPassword($this->passwordHasher->hashPassword($client, 'client123'));
            $manager->persist($client);
            $users["client{$i}"] = $client;
        }

        return $users;
    }

    private function createHotels(ObjectManager $manager, array $users): array
    {
        $hotels = [];

        $hotelData = [
            [
                'name' => 'Hôtel du Vieux-Port',
                'description' => 'Situé au cœur du Vieux-Port de Marseille, cet hôtel charme par son emplacement exceptionnel et ses chambres confortables avec vue sur le port.',
                'city' => 'Marseille',
                'address' => '12 Quai du Port, 13002 Marseille',
                'postalCode' => '13002',
                'type' => 'hotel',
                'rooms' => 25,
                'capacity' => 50,
                'pricePerNight' => '85.00',
                'status' => Hotel::STATUS_APPROVED,
                'popularity' => 95,
                'amenities' => ['wifi', 'ac', 'parking'],
                'contactName' => 'Marie Dubois',
                'contactEmail' => 'contact@hotelvieuxport.fr',
                'contactPhone' => '04 91 55 12 34',
                'image' => 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                'owner' => $users['hotelier1']
            ],
            [
                'name' => 'Villa Océan Biarritz',
                'description' => 'Villa de luxe face à l\'océan Atlantique, parfaite pour des vacances romantiques ou en famille.',
                'city' => 'Biarritz',
                'address' => '45 Avenue de l\'Impératrice, 64200 Biarritz',
                'postalCode' => '64200',
                'type' => 'villa',
                'rooms' => 8,
                'capacity' => 16,
                'pricePerNight' => '250.00',
                'status' => Hotel::STATUS_APPROVED,
                'popularity' => 88,
                'amenities' => ['wifi', 'pool', 'spa', 'parking'],
                'contactName' => 'Pierre Martin',
                'contactEmail' => 'contact@villaocean.fr',
                'contactPhone' => '05 59 24 78 90',
                'image' => 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                'owner' => $users['hotelier2']
            ],
            [
                'name' => 'Hôtel Montmartre Charme',
                'description' => 'Hôtel de charme au pied de Montmartre, proche du Sacré-Cœur et des artistes de la Place du Tertre.',
                'city' => 'Paris',
                'address' => '18 Rue des Abbesses, 75018 Paris',
                'postalCode' => '75018',
                'type' => 'hotel',
                'rooms' => 30,
                'capacity' => 60,
                'pricePerNight' => '120.00',
                'status' => Hotel::STATUS_APPROVED,
                'popularity' => 92,
                'amenities' => ['wifi', 'ac', 'restaurant'],
                'contactName' => 'Sophie Leroy',
                'contactEmail' => 'contact@montmartrecharme.fr',
                'contactPhone' => '01 42 58 45 67',
                'image' => 'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                'owner' => $users['hotelier1']
            ],
            [
                'name' => 'Auberge des Calanques',
                'description' => 'Auberge familiale proche du Parc National des Calanques, idéale pour les amoureux de la nature.',
                'city' => 'Marseille',
                'address' => '67 Route des Calanques, 13009 Marseille',
                'postalCode' => '13009',
                'type' => 'guesthouse',
                'rooms' => 12,
                'capacity' => 24,
                'pricePerNight' => '65.00',
                'status' => Hotel::STATUS_PENDING,
                'popularity' => 0,
                'amenities' => ['wifi', 'parking', 'pets'],
                'contactName' => 'Jean Calanque',
                'contactEmail' => 'contact@aubergecalanques.fr',
                'contactPhone' => '04 91 73 28 45',
                'image' => null,
                'owner' => $users['hotelier2']
            ],
            [
                'name' => 'Surf Lodge Biarritz',
                'description' => 'Lodge moderne pour surfeurs et amateurs de sports nautiques, à 50m de la plage.',
                'city' => 'Biarritz',
                'address' => '23 Avenue de la Plage, 64200 Biarritz',
                'postalCode' => '64200',
                'type' => 'other',
                'rooms' => 15,
                'capacity' => 30,
                'pricePerNight' => '95.00',
                'status' => Hotel::STATUS_PENDING,
                'popularity' => 0,
                'amenities' => ['wifi', 'gym', 'parking'],
                'contactName' => 'Lucas Surf',
                'contactEmail' => 'contact@surflodge.fr',
                'contactPhone' => '05 59 41 67 89',
                'image' => null,
                'owner' => $users['hotelier1']
            ]
        ];

        foreach ($hotelData as $data) {
            $hotel = new Hotel();
            $hotel->setName($data['name']);
            $hotel->setDescription($data['description']);
            $hotel->setCity($data['city']);
            $hotel->setAddress($data['address']);
            $hotel->setPostalCode($data['postalCode']);
            $hotel->setType($data['type']);
            $hotel->setRooms($data['rooms']);
            $hotel->setCapacity($data['capacity']);
            $hotel->setPricePerNight($data['pricePerNight']);
            $hotel->setStatus($data['status']);
            $hotel->setPopularity($data['popularity']);
            $hotel->setAmenities($data['amenities']);
            $hotel->setContactName($data['contactName']);
            $hotel->setContactEmail($data['contactEmail']);
            $hotel->setContactPhone($data['contactPhone']);
            $hotel->setImage($data['image']);
            $hotel->setOwner($data['owner']);

            $manager->persist($hotel);
            $hotels[] = $hotel;
        }

        return $hotels;
    }

    private function createActivities(ObjectManager $manager): void
    {
        $activitiesData = [
            [
                'title' => 'Visite des Calanques',
                'description' => 'Découvrez les magnifiques calanques de Marseille en bateau ou à pied. Paysages à couper le souffle garantis !',
                'city' => 'Marseille',
                'image' => 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Surf à Biarritz',
                'description' => 'Initiez-vous au surf sur les célèbres vagues de Biarritz avec nos moniteurs expérimentés.',
                'city' => 'Biarritz',
                'image' => 'https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Croisière sur la Seine',
                'description' => 'Admirez Paris depuis la Seine lors d\'une croisière romantique au coucher du soleil.',
                'city' => 'Paris',
                'image' => 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            ],
            [
                'title' => 'Dégustation de vins',
                'description' => 'Découvrez les vins de Provence lors d\'une dégustation dans les vignobles marseillais.',
                'city' => 'Marseille',
                'image' => 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
            ]
        ];

        foreach ($activitiesData as $data) {
            $activity = new Activity();
            $activity->setTitle($data['title']);
            $activity->setDescription($data['description']);
            $activity->setCity($data['city']);
            $activity->setImage($data['image']);

            $manager->persist($activity);
        }
    }

    private function createReservations(ObjectManager $manager, array $users, array $hotels): void
    {
        // Réservations pour les hôtels approuvés seulement
        $approvedHotels = array_filter($hotels, fn($h) => $h->getStatus() === Hotel::STATUS_APPROVED);

        $reservationsData = [
            [
                'hotel' => $approvedHotels[0], // Hôtel du Vieux-Port
                'client' => $users['client1'],
                'checkinDate' => new \DateTime('+5 days'),
                'checkoutDate' => new \DateTime('+8 days'),
                'guests' => 2,
                'rooms' => 1,
                'totalPrice' => '255.00',
                'status' => Reservation::STATUS_CONFIRMED,
                'message' => 'Chambre avec vue sur le port si possible'
            ],
            [
                'hotel' => $approvedHotels[1], // Villa Océan Biarritz
                'client' => $users['client2'],
                'checkinDate' => new \DateTime('+15 days'),
                'checkoutDate' => new \DateTime('+20 days'),
                'guests' => 4,
                'rooms' => 2,
                'totalPrice' => '1250.00',
                'status' => Reservation::STATUS_PENDING,
                'message' => 'Voyage de noces, merci de préparer quelque chose de spécial'
            ],
            [
                'hotel' => $approvedHotels[2], // Hôtel Montmartre Charme
                'client' => $users['client3'],
                'checkinDate' => new \DateTime('-10 days'),
                'checkoutDate' => new \DateTime('-7 days'),
                'guests' => 1,
                'rooms' => 1,
                'totalPrice' => '360.00',
                'status' => Reservation::STATUS_COMPLETED,
                'message' => null
            ]
        ];

        foreach ($reservationsData as $data) {
            $reservation = new Reservation();
            $reservation->setHotel($data['hotel']);
            $reservation->setClient($data['client']);
            $reservation->setCheckinDate($data['checkinDate']);
            $reservation->setCheckoutDate($data['checkoutDate']);
            $reservation->setGuests($data['guests']);
            $reservation->setRooms($data['rooms']);
            $reservation->setTotalPrice($data['totalPrice']);
            $reservation->setStatus($data['status']);
            $reservation->setMessage($data['message']);

            $manager->persist($reservation);
        }
    }

    private function createAvailabilities(ObjectManager $manager, array $hotels): void
    {
        // Créer des disponibilités pour les 2 prochains mois pour chaque hôtel approuvé
        $approvedHotels = array_filter($hotels, fn($h) => $h->getStatus() === Hotel::STATUS_APPROVED);

        foreach ($approvedHotels as $hotel) {
            $startDate = new \DateTime();
            $endDate = new \DateTime('+2 months');

            $currentDate = clone $startDate;
            while ($currentDate <= $endDate) {
                $availability = new Availability();
                $availability->setHotel($hotel);
                $availability->setDate(clone $currentDate);
                
                // 90% de chance d'être disponible
                $availability->setIsAvailable(rand(1, 10) <= 9);
                
                // Prix spécial pour les weekends
                if (in_array($currentDate->format('N'), [6, 7])) {
                    $weekendPrice = (float)$hotel->getPricePerNight() * 1.2;
                    $availability->setPriceOverride(number_format($weekendPrice, 2));
                }

                $manager->persist($availability);
                $currentDate->modify('+1 day');
            }
        }
    }
}