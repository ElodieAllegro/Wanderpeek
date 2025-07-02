<?php

namespace App\Controller;

use App\Repository\ListingRepository;
use App\Repository\ReservationRepository;
use App\Repository\MessageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/dashboard')]
#[IsGranted('ROLE_USER')]
class DashboardController extends AbstractController
{
    #[Route('/', name: 'app_dashboard')]
    public function index(
        ListingRepository $listingRepository,
        ReservationRepository $reservationRepository,
        MessageRepository $messageRepository
    ): Response {
        $user = $this->getUser();
        
        $userListings = $listingRepository->findByOwner($user);
        $userReservations = $reservationRepository->findByUser($user);
        $ownerReservations = $reservationRepository->findByOwner($user);
        $unreadMessages = $messageRepository->countUnreadMessages($user);

        return $this->render('dashboard/index.html.twig', [
            'user_listings' => $userListings,
            'user_reservations' => $userReservations,
            'owner_reservations' => $ownerReservations,
            'unread_messages' => $unreadMessages,
        ]);
    }
}