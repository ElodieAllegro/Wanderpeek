<?php

namespace App\Controller;

use App\Entity\Message;
use App\Entity\User;
use App\Entity\Listing;
use App\Form\MessageType;
use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/messages')]
#[IsGranted('ROLE_USER')]
class MessageController extends AbstractController
{
    #[Route('/', name: 'app_message_index')]
    public function index(MessageRepository $repository): Response
    {
        $user = $this->getUser();
        $inbox = $repository->findInbox($user);
        $sentMessages = $repository->findSentMessages($user);

        return $this->render('message/index.html.twig', [
            'inbox' => $inbox,
            'sent_messages' => $sentMessages,
        ]);
    }

    #[Route('/new', name: 'app_message_new')]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $message = new Message();
        $message->setSender($this->getUser());

        // Check if recipient and listing are provided via query parameters
        $recipientId = $request->query->get('recipient');
        $listingId = $request->query->get('listing');

        if ($recipientId) {
            $recipient = $entityManager->getRepository(User::class)->find($recipientId);
            if ($recipient) {
                $message->setRecipient($recipient);
            }
        }

        if ($listingId) {
            $listing = $entityManager->getRepository(Listing::class)->find($listingId);
            if ($listing) {
                $message->setListing($listing);
                $message->setSubject('Concernant: ' . $listing->getTitle());
                
                // If no recipient specified, set listing owner as recipient
                if (!$message->getRecipient()) {
                    $message->setRecipient($listing->getOwner());
                }
            }
        }

        $form = $this->createForm(MessageType::class, $message);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if ($message->getRecipient() === $this->getUser()) {
                $this->addFlash('error', 'Vous ne pouvez pas vous envoyer un message à vous-même.');
                return $this->render('message/new.html.twig', [
                    'message' => $message,
                    'form' => $form,
                ]);
            }

            $entityManager->persist($message);
            $entityManager->flush();

            $this->addFlash('success', 'Votre message a été envoyé.');

            return $this->redirectToRoute('app_message_show', ['id' => $message->getId()]);
        }

        return $this->render('message/new.html.twig', [
            'message' => $message,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_message_show', requirements: ['id' => '\d+'])]
    public function show(Message $message, MessageRepository $repository, EntityManagerInterface $entityManager): Response
    {
        $user = $this->getUser();
        
        if ($message->getSender() !== $user && $message->getRecipient() !== $user) {
            throw $this->createAccessDeniedException();
        }

        // Mark as read if user is the recipient
        if ($message->getRecipient() === $user && !$message->isRead()) {
            $message->setIsRead(true);
            $entityManager->flush();
        }

        // Get conversation thread
        $conversation = $repository->findConversation(
            $message->getSender(),
            $message->getRecipient(),
            $message->getListing()
        );

        return $this->render('message/show.html.twig', [
            'message' => $message,
            'conversation' => $conversation,
        ]);
    }

    #[Route('/{id}/reply', name: 'app_message_reply', requirements: ['id' => '\d+'])]
    public function reply(Request $request, Message $parentMessage, EntityManagerInterface $entityManager): Response
    {
        $user = $this->getUser();
        
        if ($parentMessage->getSender() !== $user && $parentMessage->getRecipient() !== $user) {
            throw $this->createAccessDeniedException();
        }

        $reply = new Message();
        $reply->setSender($user);
        $reply->setRecipient($parentMessage->getSender() === $user ? $parentMessage->getRecipient() : $parentMessage->getSender());
        $reply->setListing($parentMessage->getListing());
        $reply->setParentMessage($parentMessage);
        $reply->setSubject('Re: ' . $parentMessage->getSubject());

        $form = $this->createForm(MessageType::class, $reply, [
            'show_recipient' => false,
            'show_subject' => false,
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($reply);
            $entityManager->flush();

            $this->addFlash('success', 'Votre réponse a été envoyée.');

            return $this->redirectToRoute('app_message_show', ['id' => $parentMessage->getId()]);
        }

        return $this->render('message/reply.html.twig', [
            'parent_message' => $parentMessage,
            'reply' => $reply,
            'form' => $form,
        ]);
    }
}