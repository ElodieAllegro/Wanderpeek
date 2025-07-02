// UI management and DOM manipulation
export class UIManager {
  constructor() {
    this.currentPage = 'home';
    this.modal = document.getElementById('modal');
    this.modalBody = document.getElementById('modal-body');
    this.listingModal = document.getElementById('listing-modal');
    this.notificationsContainer = document.getElementById('notifications');
  }

  // Show specific page
  showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show requested page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageId;
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Update auth UI
  updateAuthUI(user) {
    const authLink = document.getElementById('auth-link');
    const dashboardLink = document.querySelector('.dashboard-link');
    const adminLink = document.querySelector('.admin-link');

    if (user) {
      authLink.textContent = user.firstName || user.email;
      authLink.dataset.page = 'dashboard';
      dashboardLink.style.display = 'block';
      
      // Show admin link for admins
      if (user.roles && user.roles.includes('ROLE_ADMIN')) {
        adminLink.style.display = 'block';
      } else {
        adminLink.style.display = 'none';
      }
    } else {
      authLink.textContent = 'Se connecter';
      authLink.dataset.page = 'login';
      dashboardLink.style.display = 'none';
      adminLink.style.display = 'none';
    }
  }

  // Render listings grid
  renderListings(listings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!listings || listings.length === 0) {
      container.innerHTML = '<p class="no-results">Aucune annonce trouvée.</p>';
      return;
    }

    container.innerHTML = listings.map(listing => `
      <div class="listing-card" data-id="${listing.id}">
        <img src="${this.getListingImage(listing)}" alt="${listing.title}" class="listing-image">
        <div class="listing-content">
          <h3 class="listing-title">${listing.title}</h3>
          <p class="listing-location">${listing.city}, ${listing.country}</p>
          <p class="listing-description">${listing.description}</p>
          <div class="listing-details">
            <span class="listing-price">${listing.pricePerNight}€/nuit</span>
            <span class="listing-guests">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
              </svg>
              ${listing.maxGuests} pers.
            </span>
          </div>
          ${listing.status ? `<span class="listing-status status-${listing.status}">${this.getStatusLabel(listing.status)}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Render user listings with actions
  renderUserListings(listings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!listings || listings.length === 0) {
      container.innerHTML = '<p class="no-results">Vous n\'avez pas encore créé d\'annonce.</p>';
      return;
    }

    container.innerHTML = listings.map(listing => `
      <div class="listing-card" data-id="${listing.id}">
        <img src="${this.getListingImage(listing)}" alt="${listing.title}" class="listing-image">
        <div class="listing-content">
          <h3 class="listing-title">${listing.title}</h3>
          <p class="listing-location">${listing.city}, ${listing.country}</p>
          <p class="listing-description">${listing.description}</p>
          <div class="listing-details">
            <span class="listing-price">${listing.pricePerNight}€/nuit</span>
            <span class="listing-guests">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
              </svg>
              ${listing.maxGuests} pers.
            </span>
          </div>
          <span class="listing-status status-${listing.status}">${this.getStatusLabel(listing.status)}</span>
          <div class="listing-actions" style="margin-top: 12px;">
            <button class="btn-secondary edit-listing" data-id="${listing.id}">Modifier</button>
            <button class="btn-danger delete-listing" data-id="${listing.id}">Supprimer</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render admin listings
  renderAdminListings(listings, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!listings || listings.length === 0) {
      container.innerHTML = '<p class="no-results">Aucune annonce en attente.</p>';
      return;
    }

    container.innerHTML = listings.map(listing => `
      <div class="admin-listing-card">
        <div class="admin-listing-header">
          <div>
            <h4>${listing.title}</h4>
            <p class="listing-location">${listing.city}, ${listing.country}</p>
            <p class="listing-description">${listing.description}</p>
            <p><strong>Propriétaire:</strong> ${listing.owner?.firstName} ${listing.owner?.lastName}</p>
            <p><strong>Prix:</strong> ${listing.pricePerNight}€/nuit</p>
          </div>
          <div class="admin-listing-actions">
            <button class="btn-success approve-listing" data-id="${listing.id}">Approuver</button>
            <button class="btn-danger reject-listing" data-id="${listing.id}">Rejeter</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render reservations
  renderReservations(reservations, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!reservations || reservations.length === 0) {
      container.innerHTML = '<p class="no-results">Aucune réservation.</p>';
      return;
    }

    container.innerHTML = reservations.map(reservation => `
      <div class="reservation-card">
        <div class="reservation-header">
          <h4 class="reservation-title">${reservation.listing?.title || 'Annonce supprimée'}</h4>
          <span class="listing-status status-${reservation.status}">${this.getStatusLabel(reservation.status)}</span>
        </div>
        <div class="reservation-details">
          <p><strong>Dates:</strong> ${this.formatDate(reservation.checkIn)} - ${this.formatDate(reservation.checkOut)}</p>
          <p><strong>Voyageurs:</strong> ${reservation.guests}</p>
          <p><strong>Prix total:</strong> ${reservation.totalPrice}€</p>
          ${reservation.message ? `<p><strong>Message:</strong> ${reservation.message}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Show listing modal
  showListingModal(listing = null) {
    const modal = this.listingModal;
    const title = document.getElementById('listing-modal-title');
    const form = document.getElementById('listing-form');

    if (listing) {
      title.textContent = 'Modifier l\'annonce';
      this.populateListingForm(listing);
    } else {
      title.textContent = 'Créer une annonce';
      form.reset();
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close listing modal
  closeListingModal() {
    this.listingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Populate listing form with data
  populateListingForm(listing) {
    const form = document.getElementById('listing-form');
    
    // Set form values
    form.querySelector('#listing-title').value = listing.title || '';
    form.querySelector('#listing-category').value = listing.category || '';
    form.querySelector('#listing-description').value = listing.description || '';
    form.querySelector('#listing-price').value = listing.pricePerNight || '';
    form.querySelector('#listing-guests').value = listing.maxGuests || '';
    form.querySelector('#listing-bedrooms').value = listing.bedrooms || '';
    form.querySelector('#listing-bathrooms').value = listing.bathrooms || '';
    form.querySelector('#listing-address').value = listing.address || '';
    form.querySelector('#listing-city').value = listing.city || '';
    form.querySelector('#listing-postal-code').value = listing.postalCode || '';
    form.querySelector('#listing-country').value = listing.country || '';

    // Set amenities checkboxes
    const amenityCheckboxes = form.querySelectorAll('input[name="amenities"]');
    amenityCheckboxes.forEach(checkbox => {
      checkbox.checked = listing.amenities && listing.amenities.includes(checkbox.value);
    });

    // Store listing ID for updates
    form.dataset.listingId = listing.id;
  }

  // Show notification
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    this.notificationsContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          this.notificationsContainer.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  // Update dashboard stats
  updateDashboardStats(stats) {
    const elements = {
      'user-listings-count': stats.userListings || 0,
      'received-reservations-count': stats.receivedReservations || 0,
      'my-reservations-count': stats.myReservations || 0,
      'unread-messages-count': stats.unreadMessages || 0,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  // Update admin stats
  updateAdminStats(stats) {
    const elements = {
      'pending-listings-count': stats.pendingListings || 0,
      'active-users-count': stats.activeUsers || 0,
      'total-reservations-count': stats.totalReservations || 0,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }

  // Helper methods
  getListingImage(listing) {
    if (listing.mainImage) {
      return `/uploads/listings/${listing.mainImage}`;
    }
    return 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
  }

  getStatusLabel(status) {
    const statusLabels = {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'confirmed': 'Confirmée',
      'cancelled': 'Annulée',
    };
    return statusLabels[status] || status;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Show loading state
  showLoading(element) {
    if (element) {
      element.classList.add('loading');
    }
  }

  // Hide loading state
  hideLoading(element) {
    if (element) {
      element.classList.remove('loading');
    }
  }
}