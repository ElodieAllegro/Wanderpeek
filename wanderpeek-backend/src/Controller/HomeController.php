<?php

namespace App\Controller;

use App\Repository\HotelRepository;
use App\Repository\ActivityRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(): JsonResponse
    {
        return $this->json([
            'message' => 'Bienvenue sur l\'API Wanderpeek',
            'version' => '1.0.0',
            'endpoints' => [
                'hotels' => '/api/hotels',
                'activities' => '/api/activities',
                'reservations' => '/api/reservations',
                'auth' => '/api/auth'
            ]
        ]);
    }

    #[Route('/api/hotels', name: 'api_hotels', methods: ['GET'])]
    public function getHotels(Request $request, HotelRepository $hotelRepository): JsonResponse
    {
        $city = $request->query->get('city');
        $popular = $request->query->get('popular');

        if ($popular === 'true') {
            $hotels = $hotelRepository->findPopularHotels(3);
        } elseif ($city) {
            $hotels = $hotelRepository->findApprovedHotelsByCity($city);
        } else {
            $hotels = $hotelRepository->findApprovedHotels();
        }

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
                'pricePerNight' => (float) $hotel->getPricePerNight(),
                'popularity' => $hotel->getPopularity(),
                'amenities' => $hotel->getAmenities(),
                'image' => $hotel->getImage(),
                'createdAt' => $hotel->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/activities', name: 'api_activities', methods: ['GET'])]
    public function getActivities(Request $request, ActivityRepository $activityRepository): JsonResponse
    {
        $city = $request->query->get('city');

        if ($city) {
            $activities = $activityRepository->findByCity($city);
        } else {
            $activities = $activityRepository->findAll();
        }

        $data = [];
        foreach ($activities as $activity) {
            $data[] = [
                'id' => $activity->getId(),
                'title' => $activity->getTitle(),
                'description' => $activity->getDescription(),
                'city' => $activity->getCity(),
                'image' => $activity->getImage(),
                'createdAt' => $activity->getCreatedAt()->format('Y-m-d H:i:s')
            ];
        }

        return $this->json($data);
    }

    #[Route('/api/cities', name: 'api_cities', methods: ['GET'])]
    public function getCities(HotelRepository $hotelRepository): JsonResponse
    {
        $cities = $hotelRepository->findCities();
        return $this->json($cities);
    }
}