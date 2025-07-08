import { generateStars } from './data.js';

export class UIManager {
  constructor() {
    this.currentPage = 'home';
    this.modal = document.getElementById('modal');
    this.modalBody = document.getElementById('modal-body');
  }

  showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageId;
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      }
    });

    window.scrollTo(0, 0);
  }

  renderAccommodationCards(accommodations, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = accommodations.map(accommodation => `
      <div class="card" data-id="${accommodation.id}" data-type="accommodation">
        <img src="${accommodation.image || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}" alt="${accommodation.name || accommodation.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${accommodation.name || accommodation.title}</h3>
          <p class="card-price">Nuit à partir de <strong>${accommodation.price_per_night || accommodation.price}€</strong></p>
          <div class="card-rating">
            ${accommodation.rating ? generateStars(accommodation.rating) : generateStars(4)}
          </div>
        </div>
      </div>
    `).join('');
  }

  renderPopularCards(accommodations, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = accommodations.map(accommodation => `
      <div class="popular-card" data-id="${accommodation.id}" data-type="accommodation">
        <img src="${accommodation.image || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}" alt="${accommodation.name || accommodation.title}" class="popular-card-image">
        <div class="popular-card-content">
          <h3 class="popular-card-title">${accommodation.name || accommodation.title}</h3>
          <p class="popular-card-price">Nuit à partir de <strong>${accommodation.price_per_night || accommodation.price}€</strong></p>
          <div class="card-rating">
            ${accommodation.rating ? generateStars(accommodation.rating) : generateStars(4)}
          </div>
        </div>
      </div>
    `).join('');
  }

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

  showAccommodationModal(accommodation) {
    const modalContent = `
      <div class="modal-header">
        <img src="${accommodation.image || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}" alt="${accommodation.name || accommodation.title}">
      </div>
      <div class="modal-body">
        <h2 class="modal-title">${accommodation.name || accommodation.title}</h2>
        <div class="modal-price">Nuit à partir de ${accommodation.price_per_night || accommodation.price}€</div>
        <div class="modal-rating">
          ${accommodation.rating ? generateStars(accommodation.rating) : generateStars(4)}
          ${accommodation.rating ? `<span>(${accommodation.rating}/5)</span>` : ''}
        </div>
        <p class="modal-description">${accommodation.description}</p>
        
        ${accommodation.amenities && accommodation.amenities.length > 0 ? `
          <div class="amenities">
            <h4>Équipements</h4>
            <ul>
              ${Array.isArray(accommodation.amenities) 
                ? accommodation.amenities.map(amenity => `<li>${this.formatAmenity(amenity)}</li>`).join('')
                : `<li>Équipements disponibles</li>`
              }
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
    this.modal.querySelector('.modal-content').dataset.hotelId = accommodation.id;
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkin').min = today;
    document.getElementById('checkout').min = today;

    document.getElementById('checkin').addEventListener('change', (e) => {
      const checkinDate = new Date(e.target.value);
      checkinDate.setDate(checkinDate.getDate() + 1);
      document.getElementById('checkout').min = checkinDate.toISOString().split('T')[0];
    });
  }

  formatAmenity(amenity) {
    const amenityMap = {
      'wifi': 'WiFi gratuit',
      'ac': 'Climatisation',
      'parking': 'Parking',
      'pool': 'Piscine',
      'spa': 'Spa',
      'restaurant': 'Restaurant',
      'bar': 'Bar',
      'gym': 'Salle de sport',
      'pets': 'Animaux acceptés',
      'kitchen': 'Cuisine équipée',
      'beach_access': 'Accès plage',
      'surf_school': 'École de surf',
      'business_center': 'Centre d\'affaires'
    };
    
    return amenityMap[amenity] || amenity;
  }
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

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

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

  renderReservations(reservations) {
    const container = document.getElementById('reservations-list');
    if (!container) return;

    if (reservations.length === 0) {
      container.innerHTML = '<p>Aucune réservation pour le moment.</p>';
      return;
    }

    container.innerHTML = reservations.map(reservation => `
      <div class="reservation-card">
        <h4>${reservation.hotels?.name || reservation.accommodationTitle}</h4>
        <p><strong>Dates:</strong> ${this.formatDate(reservation.checkin_date || reservation.checkin)} - ${this.formatDate(reservation.checkout_date || reservation.checkout)}</p>
        <p><strong>Voyageurs:</strong> ${reservation.guests}</p>
        <p><strong>Chambres:</strong> ${reservation.rooms}</p>
        <p><strong>Prix estimé:</strong> ${reservation.total_price || reservation.totalPrice}€</p>
        ${reservation.message ? `<p><strong>Message:</strong> ${reservation.message}</p>` : ''}
        <p><strong>Date de réservation:</strong> ${this.formatDate(reservation.created_at || reservation.createdAt)}</p>
        <span class="reservation-status ${reservation.status}">${this.getStatusText(reservation.status)}</span>
      </div>
    `).join('');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'En attente',
      'en_attente': 'En attente',
      'confirmed': 'Confirmée',
      'confirmee': 'Confirmée',
      'cancelled': 'Annulée',
      'annulee': 'Annulée',
      'terminee': 'Terminée'
    };
    return statusMap[status] || status;
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? '#00A693' : '#FF6B6B'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 3000;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

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

  updateInfoText(text) {
    const infoElement = document.getElementById('info-text');
    if (infoElement) {
      infoElement.textContent = text;
    }
  }
}