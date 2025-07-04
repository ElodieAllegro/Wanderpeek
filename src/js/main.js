// Main application logic
import { AuthManager } from './auth.js';
import { UIManager } from './ui.js';
import { 
  accommodations, 
  popularAccommodations, 
  activities, 
  cities,
  getRandomAccommodations 
} from './data.js';

class BookiApp {
  constructor() {
    this.authManager = new AuthManager();
    this.uiManager = new UIManager();
    this.currentCity = 'Marseille';
    this.activeFilters = new Set();
    this.isAuthMode = 'login'; // 'login' or 'register'
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadInitialData();
    this.setupAuth();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.uiManager.showPage(page);
      });
    });

    // Search form
    document.getElementById('search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSearch();
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleFilter(btn.dataset.filter);
      });
    });

    // Card clicks
    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card) {
        this.handleCardClick(card);
      }
    });

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.uiManager.closeModal();
    });

    // Click outside modal to close
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.uiManager.closeModal();
      }
    });

    // Auth form
    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAuth(e);
    });

    // Auth mode switch
    document.getElementById('auth-switch-btn').addEventListener('click', () => {
      this.toggleAuthMode();
    });

    // Logout
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        this.authManager.logout();
        this.uiManager.showPage('home');
      }
    });

    // Booking form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'booking-form') {
        e.preventDefault();
        this.handleBooking(e);
      }
    });

    // Show more button
    document.getElementById('show-more-btn').addEventListener('click', () => {
      this.showMoreAccommodations();
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.uiManager.closeModal();
      }
    });
  }

  loadInitialData() {
    this.displayAccommodations();
    this.displayPopularAccommodations();
    this.displayActivities();
    this.updateCityDisplay();
  }

  setupAuth() {
    // Check if user is already logged in
    if (this.authManager.isLoggedIn()) {
      this.uiManager.updateAuthUI(this.authManager.currentUser);
    }

    // Listen for auth state changes
    this.authManager.onAuthStateChange((user) => {
      this.uiManager.updateAuthUI(user);
      if (user) {
        this.updateAccountPage();
      }
    });
  }

  handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) return;

    // Extract city name (remove ", France" if present)
    const city = searchTerm.split(',')[0].trim();
    
    // Check if city exists in our data
    const cityExists = cities.some(c => c.toLowerCase() === city.toLowerCase());
    
    if (cityExists) {
      this.currentCity = city;
      this.displayAccommodations();
      this.displayActivities();
      this.updateCityDisplay();
    } else {
      // For demo purposes, generate random data for unknown cities
      this.currentCity = city;
      this.displayAccommodations();
      this.displayActivities();
      this.updateCityDisplay();
    }

    // Reset filters
    this.activeFilters.clear();
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  toggleFilter(filterType) {
    const filterBtn = document.querySelector(`[data-filter="${filterType}"]`);
    
    if (this.activeFilters.has(filterType)) {
      this.activeFilters.delete(filterType);
      filterBtn.classList.remove('active');
    } else {
      this.activeFilters.add(filterType);
      filterBtn.classList.add('active');
    }

    this.displayAccommodations();
  }

  displayAccommodations() {
    let cityAccommodations = accommodations[this.currentCity];
    
    // If city doesn't exist in our data, generate random accommodations
    if (!cityAccommodations) {
      cityAccommodations = getRandomAccommodations(this.currentCity);
    }

    // Apply filters
    let filteredAccommodations = cityAccommodations;
    if (this.activeFilters.size > 0) {
      filteredAccommodations = cityAccommodations.filter(acc => 
        this.activeFilters.has(acc.category)
      );
    }

    this.uiManager.renderAccommodationCards(filteredAccommodations, 'accommodations-grid');
    
    // Update info text
    const count = filteredAccommodations.length;
    const infoText = `Plus de ${count} logements sont disponibles dans cette ville`;
    this.uiManager.updateInfoText(infoText);
  }

  displayPopularAccommodations() {
    this.uiManager.renderPopularCards(popularAccommodations, 'popular-list');
  }

  displayActivities() {
    let cityActivities = activities[this.currentCity];
    
    // If city doesn't exist, show default message
    if (!cityActivities) {
      cityActivities = [
        {
          id: Date.now(),
          title: `Centre-ville de ${this.currentCity}`,
          image: 'https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
          description: `Découvrez le charme du centre historique de ${this.currentCity}.`
        },
        {
          id: Date.now() + 1,
          title: `Musée de ${this.currentCity}`,
          image: 'https://images.pexels.com/photos/2225617/pexels-photo-2225617.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
          description: `Explorez l'histoire et la culture locale de ${this.currentCity}.`
        }
      ];
    }

    this.uiManager.renderActivityCards(cityActivities, 'activities-grid');
    this.uiManager.renderActivityCards(cityActivities, 'activities-page-grid');
  }

  updateCityDisplay() {
    this.uiManager.updateCityName(this.currentCity);
  }

  handleCardClick(card) {
    const id = parseInt(card.dataset.id);
    const type = card.dataset.type;

    if (type === 'accommodation') {
      // Find accommodation in all sources
      let accommodation = null;
      
      // Check regular accommodations
      Object.values(accommodations).forEach(cityAccs => {
        const found = cityAccs.find(acc => acc.id === id);
        if (found) accommodation = found;
      });
      
      // Check popular accommodations
      if (!accommodation) {
        accommodation = popularAccommodations.find(acc => acc.id === id);
      }
      
      // Check generated accommodations
      if (!accommodation) {
        const generated = getRandomAccommodations(this.currentCity);
        accommodation = generated.find(acc => acc.id === id);
      }

      if (accommodation) {
        this.uiManager.showAccommodationModal(accommodation);
      }
    } else if (type === 'activity') {
      // Find activity
      let activity = null;
      Object.values(activities).forEach(cityActs => {
        const found = cityActs.find(act => act.id === id);
        if (found) activity = found;
      });

      if (activity) {
        this.uiManager.showActivityModal(activity);
      }
    }
  }

  handleAuth(e) {
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (this.isAuthMode === 'login') {
      const result = this.authManager.login(email, password);
      if (result.success) {
        this.uiManager.showNotification('Connexion réussie !');
        this.uiManager.showPage('account');
        this.updateAccountPage();
      } else {
        this.uiManager.showNotification(result.message, 'error');
      }
    } else {
      const name = formData.get('name');
      const result = this.authManager.register(name, email, password);
      if (result.success) {
        this.uiManager.showNotification('Inscription réussie !');
        this.uiManager.showPage('account');
        this.updateAccountPage();
      } else {
        this.uiManager.showNotification(result.message, 'error');
      }
    }
  }

  toggleAuthMode() {
    this.isAuthMode = this.isAuthMode === 'login' ? 'register' : 'login';
    
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');
    const nameGroup = document.getElementById('name-group');

    if (this.isAuthMode === 'register') {
      title.textContent = 'S\'inscrire';
      submitBtn.textContent = 'S\'inscrire';
      switchText.textContent = 'Déjà un compte ?';
      switchBtn.textContent = 'Se connecter';
      nameGroup.style.display = 'block';
      nameGroup.querySelector('input').required = true;
    } else {
      title.textContent = 'Se connecter';
      submitBtn.textContent = 'Se connecter';
      switchText.textContent = 'Pas encore de compte ?';
      switchBtn.textContent = 'S\'inscrire';
      nameGroup.style.display = 'none';
      nameGroup.querySelector('input').required = false;
    }

    // Clear form
    document.getElementById('auth-form').reset();
  }

  updateAccountPage() {
    const user = this.authManager.currentUser;
    if (!user) return;

    document.getElementById('user-name').textContent = user.name || 'Non spécifié';
    document.getElementById('user-email').textContent = user.email;

    const reservations = this.authManager.getUserReservations();
    this.uiManager.renderReservations(reservations);
  }

  handleBooking(e) {
    if (!this.authManager.isLoggedIn()) {
      this.uiManager.showNotification('Vous devez être connecté pour réserver', 'error');
      this.uiManager.closeModal();
      this.uiManager.showPage('login');
      return;
    }

    const formData = new FormData(e.target);
    const checkin = formData.get('checkin');
    const checkout = formData.get('checkout');
    const guests = parseInt(formData.get('guests'));
    const rooms = parseInt(formData.get('rooms'));
    const message = formData.get('message');

    // Calculate number of nights
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      this.uiManager.showNotification('La date de départ doit être après la date d\'arrivée', 'error');
      return;
    }

    // Get accommodation title from modal
    const accommodationTitle = document.querySelector('.modal-title').textContent;
    const pricePerNight = parseInt(document.querySelector('.modal-price').textContent.match(/\d+/)[0]);
    const totalPrice = pricePerNight * nights;

    const reservationData = {
      accommodationTitle,
      checkin,
      checkout,
      guests,
      rooms,
      nights,
      pricePerNight,
      totalPrice,
      message: message || null
    };

    const result = this.authManager.addReservation(reservationData);
    
    if (result.success) {
      this.uiManager.showNotification(`Demande de réservation envoyée ! Total: ${totalPrice}€`);
      this.uiManager.closeModal();
      this.updateAccountPage();
    } else {
      this.uiManager.showNotification(result.message, 'error');
    }
  }

  showMoreAccommodations() {
    // For demo purposes, this could load more accommodations
    // For now, we'll just show a message
    this.uiManager.showNotification('Aucun hébergement supplémentaire disponible');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BookiApp();
});