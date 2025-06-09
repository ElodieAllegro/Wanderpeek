// Data simulation for accommodations, activities, and cities
export const cities = [
  'Marseille',
  'Paris',
  'Lyon',
  'Toulouse',
  'Nice',
  'Nantes',
  'Strasbourg',
  'Montpellier',
  'Bordeaux',
  'Lille'
];

export const accommodations = {
  'Marseille': [
    {
      id: 1,
      title: 'Hôtel du port',
      price: 52,
      rating: 4,
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'economique',
      description: 'Situé au cœur du Vieux-Port de Marseille, cet hôtel charme par son emplacement exceptionnel et ses chambres confortables avec vue sur le port. Parfait pour explorer la ville à pied.',
      amenities: ['WiFi gratuit', 'Climatisation', 'Vue sur le port', 'Petit-déjeuner']
    },
    {
      id: 2,
      title: 'Hôtel Chez Amina',
      price: 96,
      rating: 4,
      image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'familial',
      description: 'Hôtel familial chaleureux proposant des chambres spacieuses et un service personnalisé. Idéal pour les familles avec enfants.',
      amenities: ['WiFi gratuit', 'Climatisation', 'Chambre familiale', 'Parking']
    },
    {
      id: 3,
      title: 'Hôtel Les mouettes',
      price: 76,
      rating: 4,
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'romantique',
      description: 'Établissement romantique avec terrasse panoramique sur la Méditerranée. Parfait pour un séjour en amoureux.',
      amenities: ['WiFi gratuit', 'Terrasse', 'Vue mer', 'Room service']
    },
    {
      id: 4,
      title: 'Hôtel de la mer',
      price: 46,
      rating: 4,
      image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'economique',
      description: 'Hôtel économique près de la plage avec un excellent rapport qualité-prix. Chambres simples mais confortables.',
      amenities: ['WiFi gratuit', 'Proche plage', 'Réception 24h/24']
    },
    {
      id: 5,
      title: 'Auberge de la Canebière',
      price: 52,
      rating: 4,
      image: 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'pepites',
      description: 'Auberge authentique sur la célèbre Canebière, mêlant charme provençal et modernité.',
      amenities: ['WiFi gratuit', 'Bar', 'Centre historique', 'Climatisation']
    },
    {
      id: 6,
      title: 'Auberge le Panier',
      price: 23,
      rating: 4,
      image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'economique',
      description: 'Auberge de jeunesse dans le quartier historique du Panier. Ambiance conviviale et prix attractifs.',
      amenities: ['WiFi gratuit', 'Cuisine commune', 'Centre historique', 'Bagagerie']
    }
  ],
  'Paris': [
    {
      id: 7,
      title: 'Hôtel Le Marais',
      price: 120,
      rating: 5,
      image: 'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'romantique',
      description: 'Hôtel de charme au cœur du Marais historique, avec des chambres élégantes et un service raffiné.',
      amenities: ['WiFi gratuit', 'Climatisation', 'Concierge', 'Centre historique']
    },
    {
      id: 8,
      title: 'Hôtel Montmartre',
      price: 85,
      rating: 4,
      image: 'https://images.pexels.com/photos/594077/pexels-photo-594077.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'pepites',
      description: 'Hôtel pittoresque à Montmartre, près du Sacré-Cœur, offrant une vue imprenable sur Paris.',
      amenities: ['WiFi gratuit', 'Vue panoramique', 'Ascenseur', 'Proche métro']
    }
  ],
  'Lyon': [
    {
      id: 9,
      title: 'Hôtel Presqu\'île',
      price: 78,
      rating: 4,
      image: 'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: 'familial',
      description: 'Hôtel moderne dans le centre de Lyon, idéal pour découvrir la gastronomie lyonnaise.',
      amenities: ['WiFi gratuit', 'Restaurant', 'Centre-ville', 'Parking']
    }
  ]
};

export const popularAccommodations = [
  {
    id: 101,
    title: 'Hôtel Le soleil du matin',
    price: 128,
    rating: 4,
    image: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    city: 'Marseille',
    description: 'Hôtel de luxe avec spa et vue panoramique sur la Méditerranée.',
    amenities: ['Spa', 'Piscine', 'Vue mer', 'Restaurant gastronomique']
  },
  {
    id: 102,
    title: 'Chambres d\'hôtes Au cœur de l\'eau',
    price: 71,
    rating: 4,
    image: 'https://images.pexels.com/photos/1267438/pexels-photo-1267438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    city: 'Marseille',
    description: 'Chambres d\'hôtes authentiques avec jardin méditerranéen.',
    amenities: ['Jardin', 'Petit-déjeuner maison', 'Parking privé', 'WiFi']
  },
  {
    id: 103,
    title: 'Hôtel Bleu et Blanc',
    price: 68,
    rating: 4,
    image: 'https://images.pexels.com/photos/2017802/pexels-photo-2017802.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    city: 'Marseille',
    description: 'Hôtel design aux couleurs de la Méditerranée, proche des Calanques.',
    amenities: ['Design moderne', 'Proche Calanques', 'Terrasse', 'Climatisation']
  }
];

export const activities = {
  'Marseille': [
    {
      id: 201,
      title: 'Vieux-Port',
      image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Le cœur historique de Marseille avec ses restaurants de poissons et son marché coloré.'
    },
    {
      id: 202,
      title: 'Fort de Pomègues',
      image: 'https://images.pexels.com/photos/3061217/pexels-photo-3061217.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Forteresse historique sur l\'archipel du Frioul, accessible en ferry depuis le Vieux-Port.'
    },
    {
      id: 203,
      title: 'Parc national des Calanques',
      image: 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Paysages à couper le souffle entre mer et montagne, idéal pour la randonnée.'
    },
    {
      id: 204,
      title: 'Notre-Dame-de-la-Garde',
      image: 'https://images.pexels.com/photos/2901215/pexels-photo-2901215.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Basilique emblématique offrant une vue panoramique sur toute la ville et la mer.'
    }
  ],
  'Paris': [
    {
      id: 205,
      title: 'Tour Eiffel',
      image: 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Monument emblématique de Paris et de la France.'
    },
    {
      id: 206,
      title: 'Musée du Louvre',
      image: 'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Le plus grand musée d\'art au monde.'
    }
  ],
  'Lyon': [
    {
      id: 207,
      title: 'Vieux Lyon',
      image: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: 'Quartier Renaissance classé au patrimoine mondial de l\'UNESCO.'
    }
  ]
};

// Generate star rating HTML
export function generateStars(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      starsHTML += `<svg class="star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>`;
    } else {
      starsHTML += `<svg class="star empty" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>`;
    }
  }
  return starsHTML;
}

// Get random accommodations for other cities
export function getRandomAccommodations(city, count = 6) {
  const templates = [
    {
      title: 'Hôtel Central',
      priceRange: [60, 120],
      categories: ['familial', 'economique']
    },
    {
      title: 'Auberge du Centre',
      priceRange: [30, 80],
      categories: ['economique', 'pepites']
    },
    {
      title: 'Hôtel de Luxe',
      priceRange: [100, 200],
      categories: ['romantique', 'pepites']
    },
    {
      title: 'Pension de Famille',
      priceRange: [40, 90],
      categories: ['familial', 'economique']
    }
  ];
  
  const images = [
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const price = Math.floor(Math.random() * (template.priceRange[1] - template.priceRange[0])) + template.priceRange[0];
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];
    
    return {
      id: Date.now() + index,
      title: `${template.title} ${city}`,
      price,
      rating,
      image: images[index % images.length],
      category,
      description: `Hébergement confortable au cœur de ${city}, offrant un excellent rapport qualité-prix.`,
      amenities: ['WiFi gratuit', 'Climatisation', 'Réception 24h/24']
    };
  });
}