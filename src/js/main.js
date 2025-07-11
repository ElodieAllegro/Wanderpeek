import { AuthManager } from './auth.js';
import { UIManager } from './ui.js';
import { accommodations, popularAccommodations, activities, cities, getRandomAccommodations } from './data.js';

class WanderpeekApp {
  constructor() {
    this.authManager = new AuthManager();
    this.uiManager = new UIManager();
    this.currentCity = 'Marseille';
    this.activeFilters = new Set();
    this.isAuthMode = 'login';
    
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
        this.uiManager.showPage(link.dataset.page);
      });
    });

    // Search
    document.getElementById('search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSearch();
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleFilter(btn.dataset.filter));
    });

    // Cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card) this.handleCardClick(card);
    });

    // Modal
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.uiManager.closeModal();
    });

    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.uiManager.closeModal();
    });

    // Auth
    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAuth(e);
    });

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

    // Booking
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'booking-form') {
        e.preventDefault();
        this.handleBooking(e);
      }
    });

    // Show more
    document.getElementById('show-more-btn').addEventListener('click', () => {
      this.uiManager.showNotification('Aucun hébergement supplémentaire disponible');
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.uiManager.closeModal();
    });

    // Propose hotel form
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'proposal-form') {
        e.preventDefault();
        this.handleHotelProposal(e);
      }
    });

    // Hotel proposal modal
    document.getElementById('propose-hotel-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHotelProposalModal();
    });

    document.querySelector('.hotel-proposal-close').addEventListener('click', () => {
      this.closeHotelProposalModal();
    });

    document.getElementById('hotel-proposal-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeHotelProposalModal();
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
    if (this.authManager.isLoggedIn()) {
      this.uiManager.updateAuthUI(this.authManager.currentUser);
    }

    this.authManager.onAuthStateChange((user) => {
      this.uiManager.updateAuthUI(user);
      if (user) this.updateAccountPage();
    });
  }

  handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) return;

    const city = searchTerm.split(',')[0].trim();
    this.currentCity = city;
    
    this.displayAccommodations();
    this.displayActivities();
    this.updateCityDisplay();

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
    let cityAccommodations = accommodations[this.currentCity] || getRandomAccommodations(this.currentCity);

    let filteredAccommodations = cityAccommodations;
    if (this.activeFilters.size > 0) {
      filteredAccommodations = cityAccommodations.filter(acc => 
        this.activeFilters.has(acc.category)
      );
    }

    this.uiManager.renderAccommodationCards(filteredAccommodations, 'accommodations-grid');
    
    const count = filteredAccommodations.length;
    const infoText = `Plus de ${count} logements sont disponibles dans cette ville`;
    this.uiManager.updateInfoText(infoText);
  }

  displayPopularAccommodations() {
    this.uiManager.renderPopularCards(popularAccommodations, 'popular-list');
  }

  displayActivities() {
    let cityActivities = activities[this.currentCity];
    
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
      let accommodation = null;
      
      Object.values(accommodations).forEach(cityAccs => {
        const found = cityAccs.find(acc => acc.id === id);
        if (found) accommodation = found;
      });
      
      if (!accommodation) {
        accommodation = popularAccommodations.find(acc => acc.id === id);
      }
      
      if (!accommodation) {
        const generated = getRandomAccommodations(this.currentCity);
        accommodation = generated.find(acc => acc.id === id);
      }

      if (accommodation) {
        this.uiManager.showAccommodationModal(accommodation);
      }
    } else if (type === 'activity') {
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

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      this.uiManager.showNotification('La date de départ doit être après la date d\'arrivée', 'error');
      return;
    }

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

  openHotelProposalModal() {
    const modal = document.getElementById('hotel-proposal-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeHotelProposalModal() {
    const modal = document.getElementById('hotel-proposal-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  handleHotelProposal(e) {
    const formData = new FormData(e.target);
    
    // Collect amenities
    const amenities = [];
    const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]:checked');
    amenityCheckboxes.forEach(checkbox => {
      amenities.push(checkbox.value);
    });

    const proposalData = {
      hotelName: formData.get('hotelName'),
      hotelType: formData.get('hotelType'),
      hotelDescription: formData.get('hotelDescription'),
      hotelAddress: formData.get('hotelAddress'),
      hotelCity: formData.get('hotelCity'),
      hotelPostal: formData.get('hotelPostal'),
      hotelRooms: formData.get('hotelRooms'),
      hotelCapacity: formData.get('hotelCapacity'),
      amenities: amenities,
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      contactWebsite: formData.get('contactWebsite'),
      additionalInfo: formData.get('additionalInfo'),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Save to localStorage
    const proposals = JSON.parse(localStorage.getItem('hotelProposals') || '[]');
    proposals.push({
      id: Date.now(),
      ...proposalData
    });
    localStorage.setItem('hotelProposals', JSON.stringify(proposals));

    // Show success message
    this.uiManager.showNotification('Votre proposition a été envoyée avec succès ! Nous vous contacterons dans les plus brefs délais.');
    
    // Close modal
    this.closeHotelProposalModal();
    
    // Reset form
    e.target.reset();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WanderpeekApp();
});