<?php

namespace App\Form;

use App\Entity\Message;
use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MessageType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        if ($options['show_recipient']) {
            $builder->add('recipient', EntityType::class, [
                'class' => User::class,
                'choice_label' => 'fullName',
                'label' => 'Destinataire',
                'attr' => ['class' => 'form-control']
            ]);
        }

        if ($options['show_subject']) {
            $builder->add('subject', TextType::class, [
                'label' => 'Sujet',
                'attr' => ['class' => 'form-control']
            ]);
        }

        $builder->add('content', TextareaType::class, [
            'label' => 'Message',
            'attr' => ['class' => 'form-control', 'rows' => 5]
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Message::class,
            'show_recipient' => true,
            'show_subject' => true,
        ]);
    }
}