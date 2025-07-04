// UI management and DOM manipulation
import { generateStars } from './data.js';

export class UIManager {
  constructor() {
    this.currentPage = 'home';
    this.modal = document.getElementById('modal');
    this.modalBody = document.getElementById('modal-body');
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

  // Render accommodation cards
  renderAccommodationCards(accommodations, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = accommodations.map(accommodation => `
      <div class="card" data-id="${accommodation.id}" data-type="accommodation">
        <img src="${accommodation.image}" alt="${accommodation.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${accommodation.title}</h3>
          <p class="card-price">Nuit à partir de <strong>${accommodation.price}€</strong></p>
          <div class="card-rating">
            ${generateStars(accommodation.rating)}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render popular accommodation cards
  renderPopularCards(accommodations, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = accommodations.map(accommodation => `
      <div class="popular-card" data-id="${accommodation.id}" data-type="accommodation">
        <img src="${accommodation.image}" alt="${accommodation.title}" class="popular-card-image">
        <div class="popular-card-content">
          <h3 class="popular-card-title">${accommodation.title}</h3>
          <p class="popular-card-price">Nuit à partir de <strong>${accommodation.price}€</strong></p>
          <div class="card-rating">
            ${generateStars(accommodation.rating)}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render activity cards
  renderActivityCards(activities, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = activities.map(activity => `
      <div class="activity-card" data-id="${activity.id}" data-type="activity">
        <img src="${activity.image}" alt="${activity.title}" class="activity-card-image">
        <div class="activity-card-content">
          <h3 class="activity-card-title">${activity.title}</h3>
        </div>
      </div>
    `).join('');
  }

  // Show accommodation modal
  showAccommodationModal(accommodation) {
    const modalContent = `
      <div class="modal-header">
        <img src="${accommodation.image}" alt="${accommodation.title}">
      </div>
      <div class="modal-body">
        <h2 class="modal-title">${accommodation.title}</h2>
        <div class="modal-price">Nuit à partir de ${accommodation.price}€</div>
        <div class="modal-rating">
          ${generateStars(accommodation.rating)}
          <span>(${accommodation.rating}/5)</span>
        </div>
        <p class="modal-description">${accommodation.description}</p>
        
        ${accommodation.amenities ? `
          <div class="amenities">
            <h4>Équipements</h4>
            <ul>
              ${accommodation.amenities.map(amenity => `<li>${amenity}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <form class="booking-form" id="booking-form">
          <h3>Réserver cet hébergement</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="checkin">Date d'arrivée</label>
              <input type="date" id="checkin" name="checkin" required>
            </div>
            <div class="form-group">
              <label for="checkout">Date de départ</label>
              <input type="date" id="checkout" name="checkout" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="guests">Nombre de voyageurs</label>
              <select id="guests" name="guests" required>
                <option value="1">1 voyageur</option>
                <option value="2">2 voyageurs</option>
                <option value="3">3 voyageurs</option>
                <option value="4">4 voyageurs</option>
                <option value="5">5 voyageurs ou plus</option>
              </select>
            </div>
            <div class="form-group">
              <label for="rooms">Nombre de chambres</label>
              <select id="rooms" name="rooms" required>
                <option value="1">1 chambre</option>
                <option value="2">2 chambres</option>
                <option value="3">3 chambres</option>
                <option value="4">4 chambres ou plus</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="message">Message (optionnel)</label>
            <textarea id="message" name="message" placeholder="Demandes spéciales..."></textarea>
          </div>
          <button type="submit" class="booking-submit-btn">Réserver maintenant</button>
        </form>
      </div>
    `;

    this.modalBody.innerHTML = modalContent;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;

    // Update checkout min date when checkin changes
    document.getElementById('checkin').addEventListener('change', (e) => {
      const checkinDate = new Date(e.target.value);
      checkinDate.setDate(checkinDate.getDate() + 1);
      document.getElementById('checkout').min = checkinDate.toISOString().split('T')[0];
    });
  }

  // Show activity modal
  showActivityModal(activity) {
    const modalContent = `
      <div class="modal-header">
        <img src="${activity.image}" alt="${activity.title}">
      </div>
      <div class="modal-body">
        <h2 class="modal-title">${activity.title}</h2>
        <p class="modal-description">${activity.description}</p>
        <div class="activity-info">
          <p><strong>Cette activité est gratuite et accessible à tous.</strong></p>
          <p>Pour plus d'informations, consultez l'office de tourisme local.</p>
        </div>
      </div>
    `;

    this.modalBody.innerHTML = modalContent;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Update auth UI
  updateAuthUI(user) {
    const authLink = document.getElementById('auth-link');
    if (user) {
      authLink.textContent = user.name || user.email;
      authLink.dataset.page = 'account';
    } else {
      authLink.textContent = 'Se connecter';
      authLink.dataset.page = 'login';
    }
  }

  // Render user reservations
  renderReservations(reservations) {
    const container = document.getElementById('reservations-list');
    if (!container) return;

    if (reservations.length === 0) {
      container.innerHTML = '<p>Aucune réservation pour le moment.</p>';
      return;
    }

    container.innerHTML = reservations.map(reservation => `
      <div class="reservation-card">
        <h4>${reservation.accommodationTitle}</h4>
        <p><strong>Dates:</strong> ${this.formatDate(reservation.checkin)} - ${this.formatDate(reservation.checkout)}</p>
        <p><strong>Voyageurs:</strong> ${reservation.guests}</p>
        <p><strong>Chambres:</strong> ${reservation.rooms}</p>
        <p><strong>Prix estimé:</strong> ${reservation.totalPrice}€</p>
        ${reservation.message ? `<p><strong>Message:</strong> ${reservation.message}</p>` : ''}
        <p><strong>Date de réservation:</strong> ${this.formatDate(reservation.createdAt)}</p>
        <span class="reservation-status ${reservation.status}">${this.getStatusText(reservation.status)}</span>
      </div>
    `).join('');
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Get status text in French
  getStatusText(status) {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'cancelled': 'Annulée'
    };
    return statusMap[status] || status;
  }

  // Show notification
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 3000;
      box-shadow: var(--shadow-medium);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Toggle filter active state
  toggleFilter(filterElement) {
    filterElement.classList.toggle('active');
  }

  // Update city name in various places
  updateCityName(cityName) {
    const elements = [
      document.getElementById('city-name'),
      document.getElementById('activities-city-name'),
      document.getElementById('activities-page-city')
    ];

    elements.forEach(element => {
      if (element) {
        element.textContent = cityName;
      }
    });
  }

  // Update info text
  updateInfoText(text) {
    const infoElement = document.getElementById('info-text');
    if (infoElement) {
      infoElement.textContent = text;
    }
  }
}