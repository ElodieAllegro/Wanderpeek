<?php

namespace App\Controller;

use App\Entity\Listing;
use App\Form\ListingType;
use App\Repository\ListingRepository;
use Doctrine\ORM\EntityManagerInterface;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/listings')]
class ListingController extends AbstractController
{
    #[Route('/', name: 'app_listing_index')]
    public function index(Request $request, ListingRepository $repository, PaginatorInterface $paginator): Response
    {
        $criteria = [
            'city' => $request->query->get('city'),
            'category' => $request->query->get('category'),
            'maxPrice' => $request->query->get('maxPrice'),
            'minGuests' => $request->query->get('minGuests'),
        ];

        $listings = $repository->searchListings(array_filter($criteria));

        $pagination = $paginator->paginate(
            $listings,
            $request->query->getInt('page', 1),
            12
        );

        return $this->render('listing/index.html.twig', [
            'pagination' => $pagination,
            'criteria' => $criteria,
        ]);
    }

    #[Route('/new', name: 'app_listing_new')]
    #[IsGranted('ROLE_USER')]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $listing = new Listing();
        $listing->setOwner($this->getUser());
        
        $form = $this->createForm(ListingType::class, $listing);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($listing);
            $entityManager->flush();

            $this->addFlash('success', 'Votre annonce a été créée et est en attente de validation.');

            return $this->redirectToRoute('app_dashboard');
        }

        return $this->render('listing/new.html.twig', [
            'listing' => $listing,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_listing_show', requirements: ['id' => '\d+'])]
    public function show(Listing $listing): Response
    {
        if ($listing->getStatus() !== Listing::STATUS_APPROVED || !$listing->isAvailable()) {
            throw $this->createNotFoundException('Cette annonce n\'est pas disponible.');
        }

        return $this->render('listing/show.html.twig', [
            'listing' => $listing,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_listing_edit', requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_USER')]
    public function edit(Request $request, Listing $listing, EntityManagerInterface $entityManager): Response
    {
        if ($listing->getOwner() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        $form = $this->createForm(ListingType::class, $listing);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $listing->setUpdatedAt(new \DateTime());
            $entityManager->flush();

            $this->addFlash('success', 'Votre annonce a été mise à jour.');

            return $this->redirectToRoute('app_listing_show', ['id' => $listing->getId()]);
        }

        return $this->render('listing/edit.html.twig', [
            'listing' => $listing,
            'form' => $form,
        ]);
    }

    #[Route('/{id}/delete', name: 'app_listing_delete', requirements: ['id' => '\d+'], methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function delete(Request $request, Listing $listing, EntityManagerInterface $entityManager): Response
    {
        if ($listing->getOwner() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        if ($this->isCsrfTokenValid('delete'.$listing->getId(), $request->request->get('_token'))) {
            $entityManager->remove($listing);
            $entityManager->flush();

            $this->addFlash('success', 'Votre annonce a été supprimée.');
        }

        return $this->redirectToRoute('app_dashboard');
    }
}