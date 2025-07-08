<?php

namespace App\Controller;

use App\Entity\Hotel;
use App\Repository\HotelRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/hotels')]
class HotelController extends AbstractController
{
    #[Route('/propose', name: 'api_hotel_propose', methods: ['POST'])]
    public function proposeHotel(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données JSON invalides'], 400);
        }

        $hotel = new Hotel();
        $hotel->setName($data['hotelName'] ?? '');
        $hotel->setType($data['hotelType'] ?? '');
        $hotel->setDescription($data['hotelDescription'] ?? '');
        $hotel->setAddress($data['hotelAddress'] ?? '');
        $hotel->setCity($data['hotelCity'] ?? '');
        $hotel->setPostalCode($data['hotelPostal'] ?? '');
        $hotel->setRooms((int) ($data['hotelRooms'] ?? 0));
        $hotel->setCapacity((int) ($data['hotelCapacity'] ?? 0));
        $hotel->setAmenities($data['amenities'] ?? []);
        $hotel->setContactName($data['contactName'] ?? '');
        $hotel->setContactEmail($data['contactEmail'] ?? '');
        $hotel->setContactPhone($data['contactPhone'] ?? '');
        $hotel->setWebsite($data['contactWebsite'] ?? null);
        $hotel->setAdditionalInfo($data['additionalInfo'] ?? null);
        $hotel->setStatus(Hotel::STATUS_PENDING);
        $hotel->setPricePerNight('100.00'); // Prix par défaut, à modifier par l'admin
        $hotel->setPopularity(0);

        // Validation
        $errors = $validator->validate($hotel);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json(['errors' => $errorMessages], 400);
        }

        $entityManager->persist($hotel);
        $entityManager->flush();

        return $this->json([
            'message' => 'Proposition d\'hôtel envoyée avec succès',
            'id' => $hotel->getId()
        ], 201);
    }

    #[Route('/{id}', name: 'api_hotel_show', methods: ['GET'])]
    public function show(Hotel $hotel): JsonResponse
    {
        return $this->json([
            'id' => $hotel->getId(),
            'name' => $hotel->getName(),
            'description' => $hotel->getDescription(),
            'city' => $hotel->getCity(),
            'address' => $hotel->getAddress(),
            'postalCode' => $hotel->getPostalCode(),
            'type' => $hotel->getType(),
            'rooms' => $hotel->getRooms(),
            'capacity' => $hotel->getCapacity(),
            'pricePerNight' => (float) $hotel->getPricePerNight(),
            'status' => $hotel->getStatus(),
            'popularity' => $hotel->getPopularity(),
            'amenities' => $hotel->getAmenities(),
            'contactName' => $hotel->getContactName(),
            'contactEmail' => $hotel->getContactEmail(),
            'contactPhone' => $hotel->getContactPhone(),
            'website' => $hotel->getWebsite(),
            'additionalInfo' => $hotel->getAdditionalInfo(),
            'image' => $hotel->getImage(),
            'createdAt' => $hotel->getCreatedAt()->format('Y-m-d H:i:s')
        ]);
    }
}