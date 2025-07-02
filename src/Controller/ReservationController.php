<?php

namespace App\Controller;

use App\Entity\Listing;
use App\Entity\Reservation;
use App\Form\ReservationType;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/reservations')]
#[IsGranted('ROLE_USER')]
class ReservationController extends AbstractController
{
    #[Route('/', name: 'app_reservation_index')]
    public function index(ReservationRepository $repository): Response
    {
        $user = $this->getUser();
        $userReservations = $repository->findByUser($user);
        $ownerReservations = $repository->findByOwner($user);

        return $this->render('reservation/index.html.twig', [
            'user_reservations' => $userReservations,
            'owner_reservations' => $ownerReservations,
        ]);
    }

    #[Route('/new/{listing}', name: 'app_reservation_new', requirements: ['listing' => '\d+'])]
    public function new(Request $request, Listing $listing, EntityManagerInterface $entityManager, ReservationRepository $repository): Response
    {
        if ($listing->getStatus() !== Listing::STATUS_APPROVED || !$listing->isAvailable()) {
            throw $this->createNotFoundException('Cette annonce n\'est pas disponible.');
        }

        if ($listing->getOwner() === $this->getUser()) {
            $this->addFlash('error', 'Vous ne pouvez pas réserver votre propre annonce.');
            return $this->redirectToRoute('app_listing_show', ['id' => $listing->getId()]);
        }

        $reservation = new Reservation();
        $reservation->setUser($this->getUser());
        $reservation->setListing($listing);

        $form = $this->createForm(ReservationType::class, $reservation);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Check if dates are available
            if (!$repository->isDateRangeAvailable($listing, $reservation->getCheckIn(), $reservation->getCheckOut())) {
                $this->addFlash('error', 'Ces dates ne sont pas disponibles.');
                return $this->render('reservation/new.html.twig', [
                    'reservation' => $reservation,
                    'form' => $form,
                    'listing' => $listing,
                ]);
            }

            // Calculate total price
            $nights = $reservation->getNights();
            $totalPrice = $nights * floatval($listing->getPricePerNight());
            $reservation->setTotalPrice((string) $totalPrice);

            $entityManager->persist($reservation);
            $entityManager->flush();

            $this->addFlash('success', 'Votre demande de réservation a été envoyée.');

            return $this->redirectToRoute('app_reservation_show', ['id' => $reservation->getId()]);
        }

        return $this->render('reservation/new.html.twig', [
            'reservation' => $reservation,
            'form' => $form,
            'listing' => $listing,
        ]);
    }

    #[Route('/{id}', name: 'app_reservation_show', requirements: ['id' => '\d+'])]
    public function show(Reservation $reservation): Response
    {
        $user = $this->getUser();
        
        if ($reservation->getUser() !== $user && $reservation->getListing()->getOwner() !== $user) {
            throw $this->createAccessDeniedException();
        }

        return $this->render('reservation/show.html.twig', [
            'reservation' => $reservation,
        ]);
    }

    #[Route('/{id}/confirm', name: 'app_reservation_confirm', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function confirm(Request $request, Reservation $reservation, EntityManagerInterface $entityManager): Response
    {
        if ($reservation->getListing()->getOwner() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        if ($this->isCsrfTokenValid('confirm'.$reservation->getId(), $request->request->get('_token'))) {
            $reservation->setStatus(Reservation::STATUS_CONFIRMED);
            $reservation->setUpdatedAt(new \DateTime());
            $entityManager->flush();

            $this->addFlash('success', 'La réservation a été confirmée.');
        }

        return $this->redirectToRoute('app_reservation_show', ['id' => $reservation->getId()]);
    }

    #[Route('/{id}/cancel', name: 'app_reservation_cancel', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function cancel(Request $request, Reservation $reservation, EntityManagerInterface $entityManager): Response
    {
        $user = $this->getUser();
        
        if ($reservation->getUser() !== $user && $reservation->getListing()->getOwner() !== $user) {
            throw $this->createAccessDeniedException();
        }

        if ($this->isCsrfTokenValid('cancel'.$reservation->getId(), $request->request->get('_token'))) {
            $reservation->setStatus(Reservation::STATUS_CANCELLED);
            $reservation->setUpdatedAt(new \DateTime());
            $entityManager->flush();

            $this->addFlash('success', 'La réservation a été annulée.');
        }

        return $this->redirectToRoute('app_reservation_show', ['id' => $reservation->getId()]);
    }
}