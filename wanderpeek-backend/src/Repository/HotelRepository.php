<?php

namespace App\Repository;

use App\Entity\Hotel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Hotel>
 */
class HotelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Hotel::class);
    }

    public function findApprovedHotels(): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.status = :status')
            ->setParameter('status', Hotel::STATUS_APPROVED)
            ->orderBy('h.popularity', 'DESC')
            ->addOrderBy('h.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findApprovedHotelsByCity(string $city): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.status = :status')
            ->andWhere('h.city = :city')
            ->setParameter('status', Hotel::STATUS_APPROVED)
            ->setParameter('city', $city)
            ->orderBy('h.popularity', 'DESC')
            ->addOrderBy('h.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findPopularHotels(int $limit = 3): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.status = :status')
            ->setParameter('status', Hotel::STATUS_APPROVED)
            ->orderBy('h.popularity', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findPendingHotels(): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.status = :status')
            ->setParameter('status', Hotel::STATUS_PENDING)
            ->orderBy('h.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByOwner(int $ownerId): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.owner = :owner')
            ->setParameter('owner', $ownerId)
            ->orderBy('h.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findCities(): array
    {
        return $this->createQueryBuilder('h')
            ->select('DISTINCT h.city')
            ->andWhere('h.status = :status')
            ->setParameter('status', Hotel::STATUS_APPROVED)
            ->orderBy('h.city', 'ASC')
            ->getQuery()
            ->getSingleColumnResult();
    }
}