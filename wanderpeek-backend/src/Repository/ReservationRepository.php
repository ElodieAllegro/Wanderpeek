<?php

namespace App\Repository;

use App\Entity\Reservation;
use App\Entity\User;
use App\Entity\Hotel;
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

    public function findByClient(User $client): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.client = :client')
            ->setParameter('client', $client)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByHotel(Hotel $hotel): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.hotel = :hotel')
            ->setParameter('hotel', $hotel)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByHotelOwner(User $owner): array
    {
        return $this->createQueryBuilder('r')
            ->join('r.hotel', 'h')
            ->andWhere('h.owner = :owner')
            ->setParameter('owner', $owner)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findUpcomingReservations(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.checkinDate > :today')
            ->setParameter('today', new \DateTime())
            ->orderBy('r.checkinDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findPastReservations(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.checkoutDate < :today')
            ->setParameter('today', new \DateTime())
            ->orderBy('r.checkoutDate', 'DESC')
            ->getQuery()
            ->getResult();
    }
}