<?php

namespace App\Repository;

use App\Entity\Availability;
use App\Entity\Hotel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Availability>
 */
class AvailabilityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Availability::class);
    }

    public function findByHotelAndDateRange(Hotel $hotel, \DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.hotel = :hotel')
            ->andWhere('a.date >= :startDate')
            ->andWhere('a.date <= :endDate')
            ->setParameter('hotel', $hotel)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('a.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findAvailableByHotelAndDateRange(Hotel $hotel, \DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.hotel = :hotel')
            ->andWhere('a.date >= :startDate')
            ->andWhere('a.date <= :endDate')
            ->andWhere('a.isAvailable = :available')
            ->setParameter('hotel', $hotel)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->setParameter('available', true)
            ->orderBy('a.date', 'ASC')
            ->getQuery()
            ->getResult();
    }
}