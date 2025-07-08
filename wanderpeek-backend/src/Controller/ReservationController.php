<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\Hotel;
use App\Entity\User;
use App\Repository\ReservationRepository;
use App\Repository\HotelRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/reservations')]
class ReservationController extends AbstractController
{
    #[Route('', name: 'api_reservations_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        HotelRepository $hotelRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données JSON invalides'], 400);
        }

        // Récupérer l'hôtel et le client
        $hotel = $hotelRepository->find($data['hotelId'] ?? 0);
        $client = $userRepository->find($data['clientId'] ?? 0);

        if (!$hotel || !$client) {
            return $this->json(['error' => 'Hôtel ou client introuvable'], 404);
        }

        $reservation = new Reservation();
        $reservation->setHotel($hotel);
        $reservation->setClient($client);
        $reservation->setCheckinDate(new \DateTime($data['checkinDate'] ?? 'now'));
        $reservation->setCheckoutDate(new \DateTime($data['checkoutDate'] ?? 'now'));
        $reservation->setGuests((int) ($data['guests'] ?? 1));
        $reservation->setRooms((int) ($data['rooms'] ?? 1));
        $reservation->setTotalPrice($data['totalPrice'] ?? '0.00');
        $reservation->setMessage($data['message'] ?? null);
        $reservation->setStatus(Reservation::STATUS_PENDING);

        // Validation
        $errors = $validator->validate($reservation);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $entityManager->persist($reservation);
        $entityManager->flush();

        return $this->json([
            'message' => 'Réservation créée avec succès',
            'id' => $reservation->getId()
        ], 201);
    }

    #[Route('/client/{clientId}', name: 'api_reservations_by_client', methods: ['GET'])]
    public function getByClient(int $clientId, UserRepository $userRepository, ReservationRepository $reservationRepository): JsonResponse
    {
        $client = $userRepository->find($clientId);
        if (!$client) {
            return $this->json(['error' => 'Client introuvable'], 404);
        }

        $reservations = $reservationRepository->findByClient($client);

        $data = [];
        foreach ($reservations as $reservation) {
            $data[] = [
                'id' => $reservation->getId(),
                'hotel' => [
                    'id' => $reservation->getHotel()->getId(),
                    'name' => $reservation->getHotel()->getName(),
                    'city' => $reservation->getHotel()->getCity()
                ],
                'checkinDate' => $reservation->getCheckinDate()->format('Y-m-d'),
                'checkoutDate' => $reservation->getCheckoutDate()->format('Y-m-d'),
                'guests' => $reservation->getGuests(),
                'rooms' => $reservation->getRooms(),
                'totalPrice' => (float) $reservation->getTotalPrice(),
                'status' => $reservation->getStatus(),
                'message' => $reservation->getMessage(),
                'nights' => $reservation->getNights(),
                'createdAt' => $reservation->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json($data);
    }

    #[Route('/hotel/{hotelId}', name: 'api_reservations_by_hotel', methods: ['GET'])]
    public function getByHotel(int $hotelId, HotelRepository $hotelRepository, ReservationRepository $reservationRepository): JsonResponse
    {
        $hotel = $hotelRepository->find($hotelId);
        if (!$hotel) {
            return $this->json(['error' => 'Hôtel introuvable'], 404);
        }

        $reservations = $reservationRepository->findByHotel($hotel);

        $data = [];
        foreach ($reservations as $reservation) {
            $data[] = [
                'id' => $reservation->getId(),
                'client' => [
                    'id' => $reservation->getClient()->getId(),
                    'name' => $reservation->getClient()->getName(),
                    'email' => $reservation->getClient()->getEmail()
                ],
                'checkinDate' => $reservation->getCheckinDate()->format('Y-m-d'),
                'checkoutDate' => $reservation->getCheckoutDate()->format('Y-m-d'),
                'guests' => $reservation->getGuests(),
                'rooms' => $reservation->getRooms(),
                'totalPrice' => (float) $reservation->getTotalPrice(),
                'status' => $reservation->getStatus(),
                'message' => $reservation->getMessage(),
                'nights' => $reservation->getNights(),
                'createdAt' => $reservation->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json($data);
    }

    #[Route('/{id}/status', name: 'api_reservation_update_status', methods: ['PUT'])]
    public function updateStatus(
        int $id,
        Request $request,
        ReservationRepository $reservationRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $reservation = $reservationRepository->find($id);
        if (!$reservation) {
            return $this->json(['error' => 'Réservation introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $newStatus = $data['status'] ?? null;

        $validStatuses = [
            Reservation::STATUS_PENDING,
            Reservation::STATUS_CONFIRMED,
            Reservation::STATUS_CANCELLED,
            Reservation::STATUS_COMPLETED
        ];

        if (!in_array($newStatus, $validStatuses)) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        $reservation->setStatus($newStatus);
        $entityManager->flush();

        return $this->json(['message' => 'Statut mis à jour avec succès']);
    }
}