<?php

namespace App\Controller\Admin;

use App\Entity\Hotel;
use App\Repository\HotelRepository;
use App\Repository\ReservationRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    #[Route('/dashboard', name: 'api_admin_dashboard', methods: ['GET'])]
    public function dashboard(
        HotelRepository $hotelRepository,
        ReservationRepository $reservationRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $pendingHotels = $hotelRepository->findPendingHotels();
        $totalHotels = count($hotelRepository->findAll());
        $totalReservations = count($reservationRepository->findAll());
        $totalUsers = count($userRepository->findAll());

        return $this->json([
            'stats' => [
                'pendingHotels' => count($pendingHotels),
                'totalHotels' => $totalHotels,
                'totalReservations' => $totalReservations,
                'totalUsers' => $totalUsers
            ],
            'pendingHotels' => array_map(function($hotel) {
                return [
                    'id' => $hotel->getId(),
                    'name' => $hotel->getName(),
                    'city' => $hotel->getCity(),
                    'type' => $hotel->getType(),
                    'contactName' => $hotel->getContactName(),
                    'contactEmail' => $hotel->getContactEmail(),
                    'createdAt' => $hotel->getCreatedAt()->format('Y-m-d H:i:s')
                ];
            }, $pendingHotels)
        ]);
    }

    #[Route('/hotels/pending', name: 'api_admin_hotels_pending', methods: ['GET'])]
    public function getPendingHotels(HotelRepository $hotelRepository): JsonResponse
    {
        $hotels = $hotelRepository->findPendingHotels();

        $data = [];
        foreach ($hotels as $hotel) {
            $data[] = [
                'id' => $hotel->getId(),
                'name' => $hotel->getName(),
                'description' => $hotel->getDescription(),
                'city' => $hotel->getCity(),
                'address' => $hotel->getAddress(),
                'type' => $hotel->getType(),
                'rooms' => $hotel->getRooms(),
                'capacity' => $hotel->getCapacity(),
                'amenities' => $hotel->getAmenities(),
                'contactName' => $hotel->getContactName(),
                'contactEmail' => $hotel->getContactEmail(),
                'contactPhone' => $hotel->getContactPhone(),
                'website' => $hotel->getWebsite(),
                'additionalInfo' => $hotel->getAdditionalInfo(),
                'createdAt' => $hotel->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json($data);
    }

    #[Route('/hotels/{id}/approve', name: 'api_admin_hotel_approve', methods: ['PUT'])]
    public function approveHotel(
        int $id,
        Request $request,
        HotelRepository $hotelRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $hotel = $hotelRepository->find($id);
        if (!$hotel) {
            return $this->json(['error' => 'Hôtel introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        $hotel->setStatus(Hotel::STATUS_APPROVED);
        
        // Mettre à jour le prix si fourni
        if (isset($data['pricePerNight'])) {
            $hotel->setPricePerNight($data['pricePerNight']);
        }
        
        // Mettre à jour l'image si fournie
        if (isset($data['image'])) {
            $hotel->setImage($data['image']);
        }

        $entityManager->flush();

        return $this->json(['message' => 'Hôtel approuvé avec succès']);
    }

    #[Route('/hotels/{id}/reject', name: 'api_admin_hotel_reject', methods: ['PUT'])]
    public function rejectHotel(
        int $id,
        HotelRepository $hotelRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $hotel = $hotelRepository->find($id);
        if (!$hotel) {
            return $this->json(['error' => 'Hôtel introuvable'], 404);
        }

        $hotel->setStatus(Hotel::STATUS_REJECTED);
        $entityManager->flush();

        return $this->json(['message' => 'Hôtel rejeté']);
    }

    #[Route('/hotels/{id}', name: 'api_admin_hotel_delete', methods: ['DELETE'])]
    public function deleteHotel(
        int $id,
        HotelRepository $hotelRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $hotel = $hotelRepository->find($id);
        if (!$hotel) {
            return $this->json(['error' => 'Hôtel introuvable'], 404);
        }

        $entityManager->remove($hotel);
        $entityManager->flush();

        return $this->json(['message' => 'Hôtel supprimé avec succès']);
    }

    #[Route('/hotels', name: 'api_admin_hotels_all', methods: ['GET'])]
    public function getAllHotels(HotelRepository $hotelRepository): JsonResponse
    {
        $hotels = $hotelRepository->findAll();

        $data = [];
        foreach ($hotels as $hotel) {
            $data[] = [
                'id' => $hotel->getId(),
                'name' => $hotel->getName(),
                'city' => $hotel->getCity(),
                'type' => $hotel->getType(),
                'status' => $hotel->getStatus(),
                'pricePerNight' => (float) $hotel->getPricePerNight(),
                'popularity' => $hotel->getPopularity(),
                'contactName' => $hotel->getContactName(),
                'contactEmail' => $hotel->getContactEmail(),
                'createdAt' => $hotel->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json($data);
    }
}