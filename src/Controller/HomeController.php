<?php

namespace App\Controller;

use App\Repository\ListingRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(ListingRepository $listingRepository): Response
    {
        $featuredListings = $listingRepository->findAvailableListings();
        
        // Limit to 6 featured listings for homepage
        $featuredListings = array_slice($featuredListings, 0, 6);

        return $this->render('home/index.html.twig', [
            'featured_listings' => $featuredListings,
        ]);
    }
}