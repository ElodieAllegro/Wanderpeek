<?php

namespace App\Repository;

use App\Entity\Reservation;
use App\Entity\User;
use App\Entity\Listing;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    /**
     * Find reservations by user
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.user = :user')
            ->setParameter('user', $user)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reservations for owner's listings
     */
    public function findByOwner(User $owner): array
    {
        return $this->createQueryBuilder('r')
            ->join('r.listing', 'l')
            ->andWhere('l.owner = :owner')
            ->setParameter('owner', $owner)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Check if dates are available for a listing
     */
    public function isDateRangeAvailable(Listing $listing, \DateTimeInterface $checkIn, \DateTimeInterface $checkOut, ?Reservation $excludeReservation = null): bool
    {
        $qb = $this->createQueryBuilder('r')
            ->andWhere('r.listing = :listing')
            ->andWhere('r.status IN (:statuses)')
            ->andWhere('(r.checkIn < :checkOut AND r.checkOut > :checkIn)')
            ->setParameter('listing', $listing)
            ->setParameter('statuses', [Reservation::STATUS_CONFIRMED, Reservation::STATUS_PENDING])
            ->setParameter('checkIn', $checkIn)
            ->setParameter('checkOut', $checkOut);

        if ($excludeReservation) {
            $qb->andWhere('r.id != :excludeId')
               ->setParameter('excludeId', $excludeReservation->getId());
        }

        $conflictingReservations = $qb->getQuery()->getResult();

        return empty($conflictingReservations);
    }

    /**
     * Find reservations by status
     */
    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.status = :status')
            ->setParameter('status', $status)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find upcoming reservations
     */
    public function findUpcomingReservations(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.checkIn >= :today')
            ->andWhere('r.status = :status')
            ->setParameter('today', new \DateTime())
            ->setParameter('status', Reservation::STATUS_CONFIRMED)
            ->orderBy('r.checkIn', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count reservations by status
     */
    public function countByStatus(string $status): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere('r.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }
}