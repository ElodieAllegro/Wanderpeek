<?php

namespace App\Form;

use App\Entity\Listing;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Vich\UploaderBundle\Form\Type\VichFileType;

class ListingType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'label' => 'Titre de l\'annonce',
                'attr' => ['class' => 'form-control']
            ])
            ->add('description', TextareaType::class, [
                'label' => 'Description',
                'attr' => ['class' => 'form-control', 'rows' => 5]
            ])
            ->add('category', ChoiceType::class, [
                'label' => 'Catégorie',
                'choices' => [
                    'Appartement' => Listing::CATEGORY_APARTMENT,
                    'Maison' => Listing::CATEGORY_HOUSE,
                    'Studio' => Listing::CATEGORY_STUDIO,
                    'Villa' => Listing::CATEGORY_VILLA,
                    'Chambre' => Listing::CATEGORY_ROOM,
                ],
                'attr' => ['class' => 'form-control']
            ])
            ->add('pricePerNight', MoneyType::class, [
                'label' => 'Prix par nuit (€)',
                'currency' => 'EUR',
                'attr' => ['class' => 'form-control']
            ])
            ->add('address', TextType::class, [
                'label' => 'Adresse',
                'attr' => ['class' => 'form-control']
            ])
            ->add('city', TextType::class, [
                'label' => 'Ville',
                'attr' => ['class' => 'form-control']
            ])
            ->add('postalCode', TextType::class, [
                'label' => 'Code postal',
                'attr' => ['class' => 'form-control']
            ])
            ->add('country', TextType::class, [
                'label' => 'Pays',
                'data' => 'France',
                'attr' => ['class' => 'form-control']
            ])
            ->add('maxGuests', IntegerType::class, [
                'label' => 'Nombre maximum de voyageurs',
                'attr' => ['class' => 'form-control', 'min' => 1]
            ])
            ->add('bedrooms', IntegerType::class, [
                'label' => 'Nombre de chambres',
                'attr' => ['class' => 'form-control', 'min' => 0]
            ])
            ->add('bathrooms', IntegerType::class, [
                'label' => 'Nombre de salles de bain',
                'attr' => ['class' => 'form-control', 'min' => 0]
            ])
            ->add('amenities', ChoiceType::class, [
                'label' => 'Équipements',
                'choices' => [
                    'WiFi' => 'wifi',
                    'Climatisation' => 'air_conditioning',
                    'Chauffage' => 'heating',
                    'Cuisine équipée' => 'kitchen',
                    'Lave-linge' => 'washing_machine',
                    'Lave-vaisselle' => 'dishwasher',
                    'Télévision' => 'tv',
                    'Parking' => 'parking',
                    'Balcon/Terrasse' => 'balcony',
                    'Jardin' => 'garden',
                    'Piscine' => 'pool',
                    'Animaux acceptés' => 'pets_allowed',
                ],
                'multiple' => true,
                'expanded' => true,
                'required' => false,
            ])
            ->add('mainImageFile', VichFileType::class, [
                'label' => 'Image principale',
                'required' => false,
                'allow_delete' => true,
                'delete_label' => 'Supprimer l\'image',
                'download_uri' => false,
            ])
            ->add('isAvailable', CheckboxType::class, [
                'label' => 'Disponible à la location',
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Listing::class,
        ]);
    }
}