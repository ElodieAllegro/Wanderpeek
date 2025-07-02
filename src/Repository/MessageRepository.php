<?php

namespace App\Repository;

use App\Entity\Message;
use App\Entity\User;
use App\Entity\Listing;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    /**
     * Find conversation between two users
     */
    public function findConversation(User $user1, User $user2, ?Listing $listing = null): array
    {
        $qb = $this->createQueryBuilder('m')
            ->andWhere('(m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1)')
            ->setParameter('user1', $user1)
            ->setParameter('user2', $user2);

        if ($listing) {
            $qb->andWhere('m.listing = :listing')
               ->setParameter('listing', $listing);
        }

        return $qb->orderBy('m.createdAt', 'ASC')
                  ->getQuery()
                  ->getResult();
    }

    /**
     * Find messages for a user (inbox)
     */
    public function findInbox(User $user): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.recipient = :user')
            ->andWhere('m.parentMessage IS NULL')
            ->setParameter('user', $user)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find sent messages for a user
     */
    public function findSentMessages(User $user): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.sender = :user')
            ->andWhere('m.parentMessage IS NULL')
            ->setParameter('user', $user)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count unread messages for a user
     */
    public function countUnreadMessages(User $user): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->andWhere('m.recipient = :user')
            ->andWhere('m.isRead = :read')
            ->setParameter('user', $user)
            ->setParameter('read', false)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Find messages related to a listing
     */
    public function findByListing(Listing $listing): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.listing = :listing')
            ->setParameter('listing', $listing)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(array $messageIds): void
    {
        $this->createQueryBuilder('m')
            ->update()
            ->set('m.isRead', ':read')
            ->andWhere('m.id IN (:ids)')
            ->setParameter('read', true)
            ->setParameter('ids', $messageIds)
            ->getQuery()
            ->execute();
    }
}