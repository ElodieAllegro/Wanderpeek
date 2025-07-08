<?php

namespace App\Controller\Hotelier;

use App\Entity\Availability;
use App\Repository\HotelRepository;
use App\Repository\ReservationRepository;
use App\Repository\AvailabilityRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/hotelier')]
class HotelierController extends AbstractController
{
    #[Route('/dashboard/{userId}', name: 'api_hotelier_dashboard', methods: ['GET'])]
    public function dashboard(
        int $userId,
        UserRepository $userRepository,
        HotelRepository $hotelRepository,
        ReservationRepository $reservationRepository
    ): JsonResponse {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $hotels = $hotelRepository->findByOwner($userId);
        $reservations = $reservationRepository->findByHotelOwner($user);

        $hotelData = [];
        foreach ($hotels as $hotel) {
            $hotelData[] = [
                'id' => $hotel->getId(),
                'name' => $hotel->getName(),
                'city' => $hotel->getCity(),
                'status' => $hotel->getStatus(),
                'pricePerNight' => (float) $hotel->getPricePerNight(),
                'popularity' => $hotel->getPopularity(),
                'reservationsCount' => count($hotel->getReservations())
            ];
        }

        $reservationData = [];
        foreach ($reservations as $reservation) {
            $reservationData[] = [
                'id' => $reservation->getId(),
                'hotel' => $reservation->getHotel()->getName(),
                'client' => $reservation->getClient()->getName(),
                'checkinDate' => $reservation->getCheckinDate()->format('Y-m-d'),
                'checkoutDate' => $reservation->getCheckoutDate()->format('Y-m-d'),
                'guests' => $reservation->getGuests(),
                'totalPrice' => (float) $reservation->getTotalPrice(),
                'status' => $reservation->getStatus()
            ];
        }

        return $this->json([
            'hotels' => $hotelData,
            'reservations' => $reservationData,
            'stats' => [
                'totalHotels' => count($hotels),
                'totalReservations' => count($reservations),
                'approvedHotels' => count(array_filter($hotels, fn($h) => $h->getStatus() === 'valide'))
            ]
        ]);
    }

    #[Route('/hotels/{hotelId}/availability', name: 'api_hotelier_availability', methods: ['GET'])]
    public function getAvailability(
        int $hotelId,
        Request $request,
        HotelRepository $hotelRepository,
        AvailabilityRepository $availabilityRepository
    ): JsonResponse {
        $hotel = $hotelRepository->find($hotelId);
        if (!$hotel) {
            return $this->json(['error' => 'Hôtel introuvable'], 404);
        }

        $startDate = new \DateTime($request->query->get('startDate', 'now'));
        $endDate = new \DateTime($request->query->get('endDate', '+2 months'));

        $availabilities = $availabilityRepository->findByHotelAndDateRange($hotel, $startDate, $endDate);

        $data = [];
        foreach ($availabilities as $availability) {
            $data[] = [
                'id' => $availability->getId(),
                'date' => $availability->getDate()->format('Y-m-d'),
                'isAvailable' => $availability->isIsAvailable(),
                'priceOverride' => $availability->getPriceOverride() ? (float) $availability->getPriceOverride() : null,
                'notes' => $availability->getNotes()
            ];
        }

        return $this->json($data);
    }

    #[Route('/hotels/{hotelId}/availability', name: 'api_hotelier_update_availability', methods: ['POST'])]
    public function updateAvailability(
        int $hotelId,
        Request $request,
        HotelRepository $hotelRepository,
        AvailabilityRepository $availabilityRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $hotel = $hotelRepository->find($hotelId);
        if (!$hotel) {
            return $this->json(['error' => 'Hôtel introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Données JSON invalides'], 400);
        }

        foreach ($data as $availabilityData) {
            $date = new \DateTime($availabilityData['date']);
            
            // Chercher une disponibilité existante
            $availability = $availabilityRepository->findOneBy([
                'hotel' => $hotel,
                'date' => $date
            ]);

            if (!$availability) {
                $availability = new Availability();
                $availability->setHotel($hotel);
                $availability->setDate($date);
            }

            $availability->setIsAvailable($availabilityData['isAvailable'] ?? true);
            $availability->setPriceOverride($availabilityData['priceOverride'] ?? null);
            $availability->setNotes($availabilityData['notes'] ?? null);

            $entityManager->persist($availability);
        }

        $entityManager->flush();

        return $this->json(['message' => 'Disponibilités mises à jour avec succès']);
    }
}