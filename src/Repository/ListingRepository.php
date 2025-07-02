<?php

namespace App\Repository;

use App\Entity\Listing;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Listing>
 */
class ListingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Listing::class);
    }

    /**
     * Find listings by status
     */
    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.status = :status')
            ->setParameter('status', $status)
            ->orderBy('l.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find approved and available listings
     */
    public function findAvailableListings(): array
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.status = :status')
            ->andWhere('l.isAvailable = :available')
            ->setParameter('status', Listing::STATUS_APPROVED)
            ->setParameter('available', true)
            ->orderBy('l.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search listings with filters
     */
    public function searchListings(array $criteria = []): array
    {
        $qb = $this->createQueryBuilder('l')
            ->andWhere('l.status = :status')
            ->andWhere('l.isAvailable = :available')
            ->setParameter('status', Listing::STATUS_APPROVED)
            ->setParameter('available', true);

        if (!empty($criteria['city'])) {
            $qb->andWhere('l.city LIKE :city')
               ->setParameter('city', '%' . $criteria['city'] . '%');
        }

        if (!empty($criteria['category'])) {
            $qb->andWhere('l.category = :category')
               ->setParameter('category', $criteria['category']);
        }

        if (!empty($criteria['maxPrice'])) {
            $qb->andWhere('l.pricePerNight <= :maxPrice')
               ->setParameter('maxPrice', $criteria['maxPrice']);
        }

        if (!empty($criteria['minGuests'])) {
            $qb->andWhere('l.maxGuests >= :minGuests')
               ->setParameter('minGuests', $criteria['minGuests']);
        }

        return $qb->orderBy('l.createdAt', 'DESC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Find listings by owner
     */
    public function findByOwner(User $owner): array
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.owner = :owner')
            ->setParameter('owner', $owner)
            ->orderBy('l.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count listings by status
     */
    public function countByStatus(string $status): int
    {
        return $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->andWhere('l.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find pending listings for admin
     */
    public function findPendingListings(): array
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.status = :status')
            ->setParameter('status', Listing::STATUS_PENDING)
            ->orderBy('l.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}