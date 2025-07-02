// Main application logic
import { AuthManager } from './auth.js';
import { UIManager } from './ui.js';
import api from './api.js';

class WanderpeekApp {
  constructor() {
    this.authManager = new AuthManager();
    this.uiManager = new UIManager();
    this.currentFilters = {};
    this.isAuthMode = 'login'; // 'login' or 'register'
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.setupAuth();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.handleNavigation(page);
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
        this.toggleFilter(btn);
      });
    });

    // Listings filters
    document.getElementById('apply-filters')?.addEventListener('click', () => {
      this.applyListingsFilters();
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

    // Create listing button
    document.getElementById('create-listing-btn')?.addEventListener('click', () => {
      this.uiManager.showListingModal();
    });

    // Listing form
    document.getElementById('listing-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleListingSubmit(e);
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModals();
      });
    });

    // Cancel listing button
    document.getElementById('cancel-listing')?.addEventListener('click', () => {
      this.uiManager.closeListingModal();
    });

    // Click outside modal to close
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModals();
      }
    });

    // Dynamic event delegation for listing cards and actions
    document.addEventListener('click', (e) => {
      this.handleDynamicClicks(e);
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  async loadInitialData() {
    try {
      // Load featured listings for home page
      const listings = await api.getListings({ limit: 6 });
      this.uiManager.renderListings(listings, 'featured-listings-grid');
    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.uiManager.showNotification('Erreur lors du chargement des données', 'error');
    }
  }

  setupAuth() {
    // Listen for auth state changes
    this.authManager.onAuthStateChange((user) => {
      this.uiManager.updateAuthUI(user);
      if (user) {
        this.loadUserData();
      }
    });
  }

  async handleNavigation(page) {
    this.uiManager.showPage(page);

    // Load page-specific data
    switch (page) {
      case 'listings':
        await this.loadListings();
        break;
      case 'dashboard':
        if (this.authManager.isLoggedIn()) {
          await this.loadDashboardData();
        } else {
          this.uiManager.showPage('login');
        }
        break;
      case 'admin':
        if (this.authManager.isAdmin()) {
          await this.loadAdminData();
        } else {
          this.uiManager.showPage('home');
          this.uiManager.showNotification('Accès non autorisé', 'error');
        }
        break;
    }
  }

  async handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
      this.currentFilters.city = searchTerm;
    } else {
      delete this.currentFilters.city;
    }

    this.uiManager.showPage('listings');
    await this.loadListings();
  }

  toggleFilter(filterBtn) {
    const filter = filterBtn.dataset.filter;
    
    if (filterBtn.classList.contains('active')) {
      filterBtn.classList.remove('active');
      delete this.currentFilters.category;
    } else {
      // Remove active class from all filter buttons
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      filterBtn.classList.add('active');
      this.currentFilters.category = filter;
    }

    // If we're on the listings page, reload listings
    if (this.uiManager.currentPage === 'listings') {
      this.loadListings();
    }
  }

  async applyListingsFilters() {
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const guests = document.getElementById('guests-filter').value;

    if (minPrice) this.currentFilters.minPrice = minPrice;
    else delete this.currentFilters.minPrice;

    if (maxPrice) this.currentFilters.maxPrice = maxPrice;
    else delete this.currentFilters.maxPrice;

    if (guests) this.currentFilters.minGuests = guests;
    else delete this.currentFilters.minGuests;

    await this.loadListings();
  }

  async loadListings() {
    try {
      this.uiManager.showLoading(document.getElementById('listings-grid'));
      const listings = await api.getListings(this.currentFilters);
      this.uiManager.renderListings(listings, 'listings-grid');
    } catch (error) {
      console.error('Failed to load listings:', error);
      this.uiManager.showNotification('Erreur lors du chargement des annonces', 'error');
    } finally {
      this.uiManager.hideLoading(document.getElementById('listings-grid'));
    }
  }

  async loadUserData() {
    if (!this.authManager.isLoggedIn()) return;

    try {
      // Load user-specific data when needed
      if (this.uiManager.currentPage === 'dashboard') {
        await this.loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  async loadDashboardData() {
    try {
      const [userListings, reservations] = await Promise.all([
        api.getUserListings(),
        api.getReservations(),
      ]);

      this.uiManager.renderUserListings(userListings, 'user-listings');
      this.uiManager.renderReservations(reservations.slice(0, 5), 'recent-reservations');

      // Update stats
      const stats = {
        userListings: userListings.length,
        receivedReservations: reservations.filter(r => r.type === 'received').length,
        myReservations: reservations.filter(r => r.type === 'made').length,
        unreadMessages: 0, // TODO: Implement messages
      };

      this.uiManager.updateDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.uiManager.showNotification('Erreur lors du chargement du tableau de bord', 'error');
    }
  }

  async loadAdminData() {
    try {
      const [pendingListings, stats] = await Promise.all([
        api.getPendingListings(),
        api.getStats(),
      ]);

      this.uiManager.renderAdminListings(pendingListings, 'pending-listings');
      this.uiManager.updateAdminStats(stats);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      this.uiManager.showNotification('Erreur lors du chargement des données admin', 'error');
    }
  }

  async handleAuth(e) {
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      let result;
      
      if (this.isAuthMode === 'login') {
        result = await this.authManager.login(email, password);
      } else {
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        
        result = await this.authManager.register({
          firstName,
          lastName,
          email,
          password,
        });
      }

      if (result.success) {
        this.uiManager.showNotification(
          this.isAuthMode === 'login' ? 'Connexion réussie !' : 'Inscription réussie !'
        );
        this.uiManager.showPage('dashboard');
      } else {
        this.uiManager.showNotification(result.message, 'error');
      }
    } catch (error) {
      this.uiManager.showNotification('Erreur de connexion', 'error');
    }
  }

  toggleAuthMode() {
    this.isAuthMode = this.isAuthMode === 'login' ? 'register' : 'login';
    
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');
    const nameGroup = document.getElementById('name-group');
    const lastnameGroup = document.getElementById('lastname-group');

    if (this.isAuthMode === 'register') {
      title.textContent = 'S\'inscrire';
      submitBtn.textContent = 'S\'inscrire';
      switchText.textContent = 'Déjà un compte ?';
      switchBtn.textContent = 'Se connecter';
      nameGroup.style.display = 'block';
      lastnameGroup.style.display = 'block';
      nameGroup.querySelector('input').required = true;
      lastnameGroup.querySelector('input').required = true;
    } else {
      title.textContent = 'Se connecter';
      submitBtn.textContent = 'Se connecter';
      switchText.textContent = 'Pas encore de compte ?';
      switchBtn.textContent = 'S\'inscrire';
      nameGroup.style.display = 'none';
      lastnameGroup.style.display = 'none';
      nameGroup.querySelector('input').required = false;
      lastnameGroup.querySelector('input').required = false;
    }

    // Clear form
    document.getElementById('auth-form').reset();
  }

  async handleListingSubmit(e) {
    const formData = new FormData(e.target);
    const listingId = e.target.dataset.listingId;

    // Collect amenities
    const amenities = [];
    formData.getAll('amenities').forEach(amenity => {
      amenities.push(amenity);
    });

    const listingData = {
      title: formData.get('title'),
      category: formData.get('category'),
      description: formData.get('description'),
      pricePerNight: parseFloat(formData.get('pricePerNight')),
      maxGuests: parseInt(formData.get('maxGuests')),
      bedrooms: parseInt(formData.get('bedrooms')),
      bathrooms: parseInt(formData.get('bathrooms')),
      address: formData.get('address'),
      city: formData.get('city'),
      postalCode: formData.get('postalCode'),
      country: formData.get('country'),
      amenities: amenities,
    };

    try {
      if (listingId) {
        await api.updateListing(listingId, listingData);
        this.uiManager.showNotification('Annonce mise à jour avec succès !');
      } else {
        await api.createListing(listingData);
        this.uiManager.showNotification('Annonce créée avec succès !');
      }

      this.uiManager.closeListingModal();
      
      // Reload dashboard data if we're on the dashboard
      if (this.uiManager.currentPage === 'dashboard') {
        await this.loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to save listing:', error);
      this.uiManager.showNotification('Erreur lors de la sauvegarde', 'error');
    }
  }

  handleDynamicClicks(e) {
    const target = e.target;

    // Listing card clicks
    if (target.closest('.listing-card') && !target.closest('.listing-actions')) {
      const card = target.closest('.listing-card');
      const listingId = card.dataset.id;
      this.showListingDetails(listingId);
    }

    // Edit listing
    if (target.classList.contains('edit-listing')) {
      const listingId = target.dataset.id;
      this.editListing(listingId);
    }

    // Delete listing
    if (target.classList.contains('delete-listing')) {
      const listingId = target.dataset.id;
      this.deleteListing(listingId);
    }

    // Approve listing (admin)
    if (target.classList.contains('approve-listing')) {
      const listingId = target.dataset.id;
      this.approveListing(listingId);
    }

    // Reject listing (admin)
    if (target.classList.contains('reject-listing')) {
      const listingId = target.dataset.id;
      this.rejectListing(listingId);
    }

    // Logout
    if (target.id === 'logout-btn' || target.textContent === 'Déconnexion') {
      this.authManager.logout();
      this.uiManager.showPage('home');
      this.uiManager.showNotification('Déconnexion réussie');
    }
  }

  async showListingDetails(listingId) {
    try {
      const listing = await api.getListing(listingId);
      // TODO: Implement listing details modal
      console.log('Show listing details:', listing);
    } catch (error) {
      console.error('Failed to load listing details:', error);
      this.uiManager.showNotification('Erreur lors du chargement des détails', 'error');
    }
  }

  async editListing(listingId) {
    try {
      const listing = await api.getListing(listingId);
      this.uiManager.showListingModal(listing);
    } catch (error) {
      console.error('Failed to load listing for editing:', error);
      this.uiManager.showNotification('Erreur lors du chargement de l\'annonce', 'error');
    }
  }

  async deleteListing(listingId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      await api.deleteListing(listingId);
      this.uiManager.showNotification('Annonce supprimée avec succès');
      await this.loadDashboardData();
    } catch (error) {
      console.error('Failed to delete listing:', error);
      this.uiManager.showNotification('Erreur lors de la suppression', 'error');
    }
  }

  async approveListing(listingId) {
    try {
      await api.approveListing(listingId);
      this.uiManager.showNotification('Annonce approuvée');
      await this.loadAdminData();
    } catch (error) {
      console.error('Failed to approve listing:', error);
      this.uiManager.showNotification('Erreur lors de l\'approbation', 'error');
    }
  }

  async rejectListing(listingId) {
    try {
      await api.rejectListing(listingId);
      this.uiManager.showNotification('Annonce rejetée');
      await this.loadAdminData();
    } catch (error) {
      console.error('Failed to reject listing:', error);
      this.uiManager.showNotification('Erreur lors du rejet', 'error');
    }
  }

  closeModals() {
    this.uiManager.modal.classList.remove('active');
    this.uiManager.closeListingModal();
    document.body.style.overflow = '';
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WanderpeekApp();
});