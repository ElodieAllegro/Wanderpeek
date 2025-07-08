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