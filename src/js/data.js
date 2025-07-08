// Utility functions for data formatting and fallback data
export const cities = [
  'Marseille', 'Paris', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Biarritz'
];

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

// Fallback function for generating placeholder accommodations when no data is available
export function getPlaceholderAccommodations(city, count = 6) {
  const templates = [
    { title: 'Hôtel Central', priceRange: [60, 120], categories: ['familial', 'economique'] },
    { title: 'Auberge du Centre', priceRange: [30, 80], categories: ['economique', 'pepites'] },
    { title: 'Hôtel de Luxe', priceRange: [100, 200], categories: ['romantique', 'pepites'] },
    { title: 'Pension de Famille', priceRange: [40, 90], categories: ['familial', 'economique'] }
  ];
  
  const images = [
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  ];
  
  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const price = Math.floor(Math.random() * (template.priceRange[1] - template.priceRange[0])) + template.priceRange[0];
    const rating = Math.floor(Math.random() * 2) + 4;
    const category = template.categories[Math.floor(Math.random() * template.categories.length)];
    
    return {
      id: Date.now() + index,
      name: `${template.title} ${city}`,
      title: `${template.title} ${city}`,
      price_per_night: price,
      price: price,
      rating,
      image: images[index % images.length],
      category,
      description: `Hébergement confortable au cœur de ${city}.`,
      amenities: ['WiFi gratuit', 'Climatisation', 'Réception 24h/24']
    };
  });
}

// Fallback function for generating placeholder activities
export function getPlaceholderActivities(city) {
  return [
    {
      id: Date.now(),
      title: `Centre-ville de ${city}`,
      image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: `Découvrez le charme du centre historique de ${city}.`
    },
    {
      id: Date.now() + 1,
      title: `Musée de ${city}`,
      image: 'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      description: `Explorez l'histoire et la culture locale de ${city}.`
    }
  ];
}

// Helper function to calculate rating from popularity
export function calculateRatingFromPopularity(popularity) {
  if (popularity >= 90) return 5;
  if (popularity >= 80) return 4;
  if (popularity >= 70) return 3;
  if (popularity >= 60) return 2;
  return 1;
}

// Helper function to format hotel data for display
export function formatHotelForDisplay(hotel) {
  return {
    ...hotel,
    title: hotel.name,
    price: parseFloat(hotel.price_per_night) || 0,
    rating: calculateRatingFromPopularity(hotel.popularity || 0),
    image: hotel.image || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  };
}

// Helper function to format activity data for display
export function formatActivityForDisplay(activity) {
  return {
    ...activity,
    image: activity.image || 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
  };
}