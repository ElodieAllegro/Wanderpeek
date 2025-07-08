<?php

namespace App\Repository;

use App\Entity\Activity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Activity>
 */
class ActivityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Activity::class);
    }

    public function findByCity(string $city): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.city = :city')
            ->setParameter('city', $city)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findCities(): array
    {
        return $this->createQueryBuilder('a')
            ->select('DISTINCT a.city')
            ->orderBy('a.city', 'ASC')
            ->getQuery()
            ->getSingleColumnResult();
    }
}