import { SupabaseAuthManager } from './auth-supabase.js'
import { UIManager } from './ui.js'
import { api } from './supabase.js'
import { formatHotelForDisplay, formatActivityForDisplay } from './data.js'

class WanderpeekSupabaseApp {
  constructor() {
    this.authManager = new SupabaseAuthManager()
    this.uiManager = new UIManager()
    this.currentCity = 'Marseille'
    this.activeFilters = new Set()
    this.isAuthMode = 'login'
    
    this.init()
  }

  async init() {
    this.setupEventListeners()
    await this.loadInitialData()
    this.setupAuth()
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const page = link.dataset.page
        this.uiManager.showPage(page)
        
        // Load admin dashboard if admin page is accessed
        if (page === 'admin' && this.authManager.isAdmin()) {
          this.loadAdminDashboard()
        }
      })
    })

    // Search
    document.getElementById('search-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSearch()
    })

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleFilter(btn.dataset.filter))
    })

    // Cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]')
      if (card) this.handleCardClick(card)
    })

    // Modal
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.uiManager.closeModal()
    })

    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.uiManager.closeModal()
    })

    // Auth
    document.getElementById('auth-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleAuth(e)
    })

    document.getElementById('auth-switch-btn').addEventListener('click', () => {
      this.toggleAuthMode()
    })

    // Logout
    document.addEventListener('click', (e) => {
      if (e.target.id === 'logout-btn') {
        this.authManager.logout()
        this.uiManager.showPage('home')
      }
    })

    // Booking
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'booking-form') {
        e.preventDefault()
        this.handleBooking(e)
      }
    })

    // Show more
    document.getElementById('show-more-btn').addEventListener('click', () => {
      this.uiManager.showNotification('Aucun hébergement supplémentaire disponible')
    })

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.uiManager.closeModal()
    })

    // Propose hotel form
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'proposal-form') {
        e.preventDefault()
        this.handleHotelProposal(e)
      }
    })

    // Hotel proposal modal
    document.getElementById('propose-hotel-btn').addEventListener('click', (e) => {
      e.preventDefault()
      this.openHotelProposalModal()
    })

    document.querySelector('.hotel-proposal-close').addEventListener('click', () => {
      this.closeHotelProposalModal()
    })

    document.getElementById('hotel-proposal-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeHotelProposalModal()
      }
    })

    // Admin dashboard events
    document.addEventListener('click', (e) => {
      // Admin tab switching
      if (e.target.classList.contains('admin-tab-btn')) {
        this.switchAdminTab(e.target.dataset.tab)
      }
      
      // Hotel actions
      if (e.target.classList.contains('view-hotel-btn')) {
        this.viewHotelDetails(e.target.dataset.hotelId)
      }
      
      if (e.target.classList.contains('approve-hotel-btn')) {
        this.openHotelApprovalModal(e.target.dataset.hotelId)
      }
      
      if (e.target.classList.contains('reject-hotel-btn')) {
        this.rejectHotel(e.target.dataset.hotelId)
      }
      
      if (e.target.classList.contains('delete-hotel-btn')) {
        this.deleteHotel(e.target.dataset.hotelId)
      }
    })

    // Hotel details modal
    document.querySelector('.hotel-details-close').addEventListener('click', () => {
      this.closeHotelDetailsModal()
    })

    document.getElementById('hotel-details-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeHotelDetailsModal()
      }
    })

    // Hotel approval modal
    document.querySelector('.hotel-approval-close').addEventListener('click', () => {
      this.closeHotelApprovalModal()
    })

    document.getElementById('hotel-approval-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeHotelApprovalModal()
      }
    })

    document.getElementById('hotel-approval-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleHotelApproval(e)
    })
  }

  async loadInitialData() {
    await this.displayAccommodations()
    await this.displayPopularAccommodations()
    await this.displayActivities()
    this.updateCityDisplay()
  }

  setupAuth() {
    if (this.authManager.isLoggedIn()) {
      this.uiManager.updateAuthUI(this.authManager.currentUser)
      this.updateNavigationForRole()
    }

    this.authManager.onAuthStateChange((user) => {
      this.uiManager.updateAuthUI(user)
      this.updateNavigationForRole()
      if (user) this.updateAccountPage()
    })
  }

  updateNavigationForRole() {
    const user = this.authManager.currentUser
    const navLinks = document.querySelector('.nav-links')
    
    // Remove existing admin link
    const existingAdminLink = document.querySelector('[data-page="admin"]')
    if (existingAdminLink) {
      existingAdminLink.parentElement.remove()
    }
    
    // Add admin link if user is admin
    if (user && this.authManager.isAdmin()) {
      const adminLi = document.createElement('li')
      adminLi.innerHTML = '<a href="#" data-page="admin" class="nav-link">Administration</a>'
      navLinks.insertBefore(adminLi, navLinks.lastElementChild)
      
      // Add event listener to the new admin link
      adminLi.querySelector('.nav-link').addEventListener('click', (e) => {
        e.preventDefault()
        this.uiManager.showPage('admin')
        this.loadAdminDashboard()
      })
    }
  }

  async handleSearch() {
    const searchInput = document.getElementById('search-input')
    const searchTerm = searchInput.value.trim()
    
    if (!searchTerm) return

    const city = searchTerm.split(',')[0].trim()
    this.currentCity = city
    
    await this.displayAccommodations()
    await this.displayActivities()
    this.updateCityDisplay()

    this.activeFilters.clear()
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active')
    })
  }

  toggleFilter(filterType) {
    const filterBtn = document.querySelector(`[data-filter="${filterType}"]`)
    
    if (this.activeFilters.has(filterType)) {
      this.activeFilters.delete(filterType)
      filterBtn.classList.remove('active')
    } else {
      this.activeFilters.add(filterType)
      filterBtn.classList.add('active')
    }

    this.displayAccommodations()
  }

  async displayAccommodations() {
    try {
      console.log('🔍 Recherche d\'hôtels pour la ville:', this.currentCity)
      const hotels = await api.getHotels({ city: this.currentCity })
      console.log('📊 Hôtels reçus de l\'API:', hotels)
      
      let accommodations = []
      
      if (hotels && hotels.length > 0) {
        accommodations = hotels.map(formatHotelForDisplay)
        console.log('✅ Hôtels formatés:', accommodations)
      }
      
      let filteredHotels = accommodations
      if (this.activeFilters.size > 0) {
        filteredHotels = accommodations
      }

      this.uiManager.renderAccommodationCards(filteredHotels, 'accommodations-grid')
      
      const count = filteredHotels.length
      const infoText = count > 0 
        ? `${count} logement${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''} dans cette ville`
        : `Aucun logement disponible dans cette ville`
      this.uiManager.updateInfoText(infoText)
    } catch (error) {
      console.error('Error loading accommodations:', error)
      this.uiManager.showNotification('Erreur lors du chargement des hébergements', 'error')
      this.uiManager.renderAccommodationCards([], 'accommodations-grid')
      this.uiManager.updateInfoText('Erreur lors du chargement des hébergements')
    }
  }

  async displayPopularAccommodations() {
    try {
      const popularHotels = await api.getHotels({ popular: true })
      
      let popularAccommodations = []
      if (popularHotels && popularHotels.length > 0) {
        popularAccommodations = popularHotels.map(formatHotelForDisplay)
      }
      
      this.uiManager.renderPopularCards(popularAccommodations, 'popular-list')
    } catch (error) {
      console.error('Error loading popular accommodations:', error)
      this.uiManager.renderPopularCards([], 'popular-list')
    }
  }

  async displayActivities() {
    try {
      const activities = await api.getActivities(this.currentCity)
      
      let formattedActivities = []
      if (activities && activities.length > 0) {
        formattedActivities = activities.map(formatActivityForDisplay)
      }
      
      this.uiManager.renderActivityCards(formattedActivities, 'activities-grid')
      this.uiManager.renderActivityCards(formattedActivities, 'activities-page-grid')
    } catch (error) {
      console.error('Error loading activities:', error)
      this.uiManager.renderActivityCards([], 'activities-grid')
      this.uiManager.renderActivityCards([], 'activities-page-grid')
    }
  }

  updateCityDisplay() {
    this.uiManager.updateCityName(this.currentCity)
  }

  async handleCardClick(card) {
    const id = card.dataset.id
    const type = card.dataset.type

    if (type === 'accommodation') {
      try {
        const hotel = await api.getHotel(id)
        if (hotel && !hotel.error) {
          const formattedHotel = formatHotelForDisplay(hotel)
          this.uiManager.showAccommodationModal(formattedHotel)
        } else {
          this.uiManager.showNotification('Impossible de charger les détails de cet hébergement', 'error')
        }
      } catch (error) {
        console.error('Error loading hotel details:', error)
        this.uiManager.showNotification('Erreur lors du chargement des détails', 'error')
      }
    } else if (type === 'activity') {
      // Activities don't have detailed views in this implementation
      // You could add activity details if needed
    }
  }

  async handleAuth(e) {
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    if (this.isAuthMode === 'login') {
      const result = await this.authManager.login(email, password)
      if (result.success) {
        this.uiManager.showNotification('Connexion réussie !')
        this.uiManager.showPage('account')
        await this.updateAccountPage()
      } else {
        this.uiManager.showNotification(result.message, 'error')
      }
    } else {
      const name = formData.get('name')
      const result = await this.authManager.register(name, email, password)
      if (result.success) {
        this.uiManager.showNotification('Inscription réussie !')
        this.uiManager.showPage('account')
        await this.updateAccountPage()
      } else {
        this.uiManager.showNotification(result.message, 'error')
      }
    }
  }

  toggleAuthMode() {
    this.isAuthMode = this.isAuthMode === 'login' ? 'register' : 'login'
    
    const title = document.getElementById('auth-title')
    const submitBtn = document.getElementById('auth-submit-btn')
    const switchText = document.getElementById('auth-switch-text')
    const switchBtn = document.getElementById('auth-switch-btn')
    const nameGroup = document.getElementById('name-group')

    if (this.isAuthMode === 'register') {
      title.textContent = 'S\'inscrire'
      submitBtn.textContent = 'S\'inscrire'
      switchText.textContent = 'Déjà un compte ?'
      switchBtn.textContent = 'Se connecter'
      nameGroup.style.display = 'block'
      nameGroup.querySelector('input').required = true
    } else {
      title.textContent = 'Se connecter'
      submitBtn.textContent = 'Se connecter'
      switchText.textContent = 'Pas encore de compte ?'
      switchBtn.textContent = 'S\'inscrire'
      nameGroup.style.display = 'none'
      nameGroup.querySelector('input').required = false
    }

    document.getElementById('auth-form').reset()
  }

  async updateAccountPage() {
    const user = this.authManager.currentUser
    if (!user) return

    document.getElementById('user-name').textContent = user.name || 'Non spécifié'
    document.getElementById('user-email').textContent = user.email

    const reservations = await this.authManager.getUserReservations()
    this.uiManager.renderReservations(reservations)
  }

  async handleBooking(e) {
    if (!this.authManager.isLoggedIn()) {
      this.uiManager.showNotification('Vous devez être connecté pour réserver', 'error')
      this.uiManager.closeModal()
      this.uiManager.showPage('login')
      return
    }

    const formData = new FormData(e.target)
    const checkin = formData.get('checkin')
    const checkout = formData.get('checkout')
    const guests = parseInt(formData.get('guests'))
    const rooms = parseInt(formData.get('rooms'))
    const message = formData.get('message')

    const checkinDate = new Date(checkin)
    const checkoutDate = new Date(checkout)
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      this.uiManager.showNotification('La date de départ doit être après la date d\'arrivée', 'error')
      return
    }

    const accommodationTitle = document.querySelector('.modal-title').textContent
    const pricePerNight = parseInt(document.querySelector('.modal-price').textContent.match(/\d+/)[0])
    const totalPrice = pricePerNight * nights

    // Get hotel ID from the modal
    const hotelId = document.querySelector('.modal-content').dataset.hotelId

    if (!hotelId) {
      this.uiManager.showNotification('Erreur: impossible d\'identifier l\'hébergement', 'error')
      return
    }

    const reservationData = {
      hotelId,
      checkinDate: checkin,
      checkoutDate: checkout,
      guests,
      rooms,
      totalPrice: totalPrice.toString(),
      message: message || null
    }

    const result = await this.authManager.addReservation(reservationData)
    
    if (result.success) {
      this.uiManager.showNotification(`Demande de réservation envoyée ! Total: ${totalPrice}€`)
      this.uiManager.closeModal()
      await this.updateAccountPage()
    } else {
      this.uiManager.showNotification(result.message, 'error')
    }
  }

  openHotelProposalModal() {
    const modal = document.getElementById('hotel-proposal-modal')
    modal.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  closeHotelProposalModal() {
    const modal = document.getElementById('hotel-proposal-modal')
    modal.classList.remove('active')
    document.body.style.overflow = ''
  }

  async handleHotelProposal(e) {
    const formData = new FormData(e.target)
    
    // Collect amenities
    const amenities = []
    const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]:checked')
    amenityCheckboxes.forEach(checkbox => {
      amenities.push(checkbox.value)
    })

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
      additionalInfo: formData.get('additionalInfo')
    }

    try {
      const result = await api.proposeHotel(proposalData)
      
      if (result.id) {
        this.uiManager.showNotification('Votre proposition a été envoyée avec succès ! Nous vous contacterons dans les plus brefs délais.')
        this.closeHotelProposalModal()
        e.target.reset()
      } else {
        this.uiManager.showNotification(result.error || 'Erreur lors de l\'envoi de la proposition', 'error')
      }
    } catch (error) {
      this.uiManager.showNotification('Erreur lors de l\'envoi de la proposition', 'error')
    }
  }

  // Admin Dashboard Methods
  async loadAdminDashboard() {
    if (!this.authManager.isAdmin()) {
      this.uiManager.showNotification('Accès non autorisé', 'error')
      return
    }

    try {
      const dashboardData = await api.getAdminDashboard()
      this.renderAdminStats(dashboardData.stats)
      this.renderPendingHotels(dashboardData.pendingHotels || [])
      await this.loadAllHotels()
    } catch (error) {
      console.error('Error loading admin dashboard:', error)
      this.uiManager.showNotification('Erreur lors du chargement du dashboard', 'error')
    }
  }

  renderAdminStats(stats) {
    const statsContainer = document.getElementById('admin-stats')
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${stats.pendingHotels || 0}</div>
        <div class="stat-label">Hôtels en attente</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalHotels || 0}</div>
        <div class="stat-label">Total hôtels</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalReservations || 0}</div>
        <div class="stat-label">Total réservations</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.totalUsers || 0}</div>
        <div class="stat-label">Total utilisateurs</div>
      </div>
    `
  }

  renderPendingHotels(hotels) {
    const container = document.getElementById('pending-hotels-grid')
    
    if (hotels.length === 0) {
      container.innerHTML = '<p>Aucun hôtel en attente de validation.</p>'
      return
    }

    container.innerHTML = hotels.map(hotel => `
      <div class="hotel-admin-card">
        <div class="hotel-admin-header">
          <h4 class="hotel-admin-title">${hotel.name}</h4>
          <div class="hotel-admin-meta">
            <span>${hotel.city}</span>
            <span class="hotel-status ${hotel.status}">${this.getStatusText(hotel.status)}</span>
          </div>
        </div>
        <div class="hotel-admin-body">
          <div class="hotel-admin-info">
            <p><strong>Type:</strong> ${this.getHotelTypeText(hotel.type)}</p>
            <p><strong>Chambres:</strong> ${hotel.rooms}</p>
            <p><strong>Capacité:</strong> ${hotel.capacity} personnes</p>
            <p><strong>Contact:</strong> ${hotel.contact_name}</p>
            <p><strong>Email:</strong> ${hotel.contact_email}</p>
            <p><strong>Téléphone:</strong> ${hotel.contact_phone}</p>
          </div>
          <div class="hotel-admin-actions">
            <button class="admin-btn admin-btn-primary view-hotel-btn" data-hotel-id="${hotel.id}">
              Voir détails
            </button>
            <button class="admin-btn admin-btn-success approve-hotel-btn" data-hotel-id="${hotel.id}">
              Approuver
            </button>
            <button class="admin-btn admin-btn-danger reject-hotel-btn" data-hotel-id="${hotel.id}">
              Rejeter
            </button>
          </div>
        </div>
      </div>
    `).join('')
  }

  async loadAllHotels() {
    try {
      const hotels = await api.getAllHotels()
      this.renderAllHotels(hotels || [])
    } catch (error) {
      console.error('Error loading all hotels:', error)
    }
  }

  renderAllHotels(hotels) {
    const tbody = document.getElementById('all-hotels-tbody')
    
    tbody.innerHTML = hotels.map(hotel => `
      <tr>
        <td>${hotel.name}</td>
        <td>${hotel.city}</td>
        <td>${this.getHotelTypeText(hotel.type)}</td>
        <td><span class="hotel-status ${hotel.status}">${this.getStatusText(hotel.status)}</span></td>
        <td>${hotel.price_per_night ? parseFloat(hotel.price_per_night).toFixed(2) + '€' : 'N/A'}</td>
        <td>${hotel.popularity || 0}</td>
        <td>
          <div class="table-actions">
            <button class="admin-btn admin-btn-primary view-hotel-btn" data-hotel-id="${hotel.id}">
              Voir
            </button>
            ${hotel.status === 'en_attente' ? `
              <button class="admin-btn admin-btn-success approve-hotel-btn" data-hotel-id="${hotel.id}">
                Approuver
              </button>
              <button class="admin-btn admin-btn-danger reject-hotel-btn" data-hotel-id="${hotel.id}">
                Rejeter
              </button>
            ` : ''}
            <button class="admin-btn admin-btn-danger delete-hotel-btn" data-hotel-id="${hotel.id}">
              Supprimer
            </button>
          </div>
        </td>
      </tr>
    `).join('')
  }

  switchAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')

    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.classList.remove('active')
    })
    document.getElementById(`${tabName}-tab`).classList.add('active')

    // Load specific tab data
    if (tabName === 'all') {
      this.loadAllHotels()
    } else if (tabName === 'stats') {
      this.loadDetailedStats()
    }
  }

  async loadDetailedStats() {
    const container = document.getElementById('detailed-stats')
    container.innerHTML = `
      <div class="stats-card">
        <h4>Répartition par statut</h4>
        <ul class="stats-list">
          <li><span>En attente</span><span id="stats-pending">-</span></li>
          <li><span>Validés</span><span id="stats-approved">-</span></li>
          <li><span>Refusés</span><span id="stats-rejected">-</span></li>
        </ul>
      </div>
      <div class="stats-card">
        <h4>Répartition par ville</h4>
        <ul class="stats-list" id="stats-cities">
          <li><span>Chargement...</span><span>-</span></li>
        </ul>
      </div>
      <div class="stats-card">
        <h4>Répartition par type</h4>
        <ul class="stats-list" id="stats-types">
          <li><span>Chargement...</span><span>-</span></li>
        </ul>
      </div>
    `

    try {
      const hotels = await api.getAllHotels()
      this.updateDetailedStats(hotels || [])
    } catch (error) {
      console.error('Error loading detailed stats:', error)
    }
  }

  updateDetailedStats(hotels) {
    // Status stats
    const statusCounts = hotels.reduce((acc, hotel) => {
      acc[hotel.status] = (acc[hotel.status] || 0) + 1
      return acc
    }, {})

    document.getElementById('stats-pending').textContent = statusCounts.en_attente || 0
    document.getElementById('stats-approved').textContent = statusCounts.valide || 0
    document.getElementById('stats-rejected').textContent = statusCounts.refuse || 0

    // City stats
    const cityCounts = hotels.reduce((acc, hotel) => {
      acc[hotel.city] = (acc[hotel.city] || 0) + 1
      return acc
    }, {})

    const citiesContainer = document.getElementById('stats-cities')
    citiesContainer.innerHTML = Object.entries(cityCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([city, count]) => `<li><span>${city}</span><span>${count}</span></li>`)
      .join('')

    // Type stats
    const typeCounts = hotels.reduce((acc, hotel) => {
      acc[hotel.type] = (acc[hotel.type] || 0) + 1
      return acc
    }, {})

    const typesContainer = document.getElementById('stats-types')
    typesContainer.innerHTML = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([type, count]) => `<li><span>${this.getHotelTypeText(type)}</span><span>${count}</span></li>`)
      .join('')
  }

  async viewHotelDetails(hotelId) {
    try {
      const hotel = await api.getHotel(hotelId)
      if (hotel && !hotel.error) {
        this.showHotelDetailsModal(hotel)
      } else {
        this.uiManager.showNotification('Impossible de charger les détails de l\'hôtel', 'error')
      }
    } catch (error) {
      console.error('Error loading hotel details:', error)
      this.uiManager.showNotification('Erreur lors du chargement des détails', 'error')
    }
  }

  showHotelDetailsModal(hotel) {
    const modalBody = document.getElementById('hotel-details-body')
    modalBody.innerHTML = `
      <div class="hotel-details-header">
        <h3 class="hotel-details-title">${hotel.name}</h3>
        <div class="hotel-details-meta">
          <span>${hotel.city}, ${hotel.postal_code}</span>
          <span class="hotel-status ${hotel.status}">${this.getStatusText(hotel.status)}</span>
          <span>Créé le ${new Date(hotel.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
      <div class="hotel-details-body">
        <div class="hotel-details-section">
          <h4>Description</h4>
          <p>${hotel.description}</p>
        </div>
        
        <div class="hotel-details-section">
          <h4>Informations générales</h4>
          <div class="hotel-details-grid">
            <div class="hotel-details-item">
              <strong>Type</strong>
              ${this.getHotelTypeText(hotel.type)}
            </div>
            <div class="hotel-details-item">
              <strong>Adresse</strong>
              ${hotel.address}
            </div>
            <div class="hotel-details-item">
              <strong>Chambres</strong>
              ${hotel.rooms}
            </div>
            <div class="hotel-details-item">
              <strong>Capacité</strong>
              ${hotel.capacity} personnes
            </div>
            <div class="hotel-details-item">
              <strong>Prix/nuit</strong>
              ${hotel.price_per_night ? parseFloat(hotel.price_per_night).toFixed(2) + '€' : 'Non défini'}
            </div>
            <div class="hotel-details-item">
              <strong>Popularité</strong>
              ${hotel.popularity || 0}
            </div>
          </div>
        </div>
        
        <div class="hotel-details-section">
          <h4>Contact</h4>
          <div class="hotel-details-grid">
            <div class="hotel-details-item">
              <strong>Responsable</strong>
              ${hotel.contact_name || 'Non spécifié'}
            </div>
            <div class="hotel-details-item">
              <strong>Email</strong>
              ${hotel.contact_email || 'Non spécifié'}
            </div>
            <div class="hotel-details-item">
              <strong>Téléphone</strong>
              ${hotel.contact_phone || 'Non spécifié'}
            </div>
            <div class="hotel-details-item">
              <strong>Site web</strong>
              ${hotel.website ? `<a href="${hotel.website}" target="_blank">${hotel.website}</a>` : 'Non spécifié'}
            </div>
          </div>
        </div>
        
        ${hotel.amenities && hotel.amenities.length > 0 ? `
          <div class="hotel-details-section">
            <h4>Équipements</h4>
            <div class="amenities-list">
              ${hotel.amenities.map(amenity => `<span class="amenity-tag">${this.uiManager.formatAmenity(amenity)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${hotel.additional_info ? `
          <div class="hotel-details-section">
            <h4>Informations complémentaires</h4>
            <p>${hotel.additional_info}</p>
          </div>
        ` : ''}
      </div>
    `
    
    document.getElementById('hotel-details-modal').classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  closeHotelDetailsModal() {
    document.getElementById('hotel-details-modal').classList.remove('active')
    document.body.style.overflow = ''
  }

  openHotelApprovalModal(hotelId) {
    this.currentHotelId = hotelId
    document.getElementById('hotel-approval-modal').classList.add('active')
    document.body.style.overflow = 'hidden'
    
    // Reset form
    document.getElementById('hotel-approval-form').reset()
  }

  closeHotelApprovalModal() {
    document.getElementById('hotel-approval-modal').classList.remove('active')
    document.body.style.overflow = ''
    this.currentHotelId = null
  }

  async handleHotelApproval(e) {
    const formData = new FormData(e.target)
    const updateData = {
      pricePerNight: parseFloat(formData.get('pricePerNight')),
      image: formData.get('image') || null
    }

    try {
      const result = await api.approveHotel(this.currentHotelId, updateData)
      
      if (result.message) {
        this.uiManager.showNotification('Hôtel approuvé avec succès !')
        this.closeHotelApprovalModal()
        this.loadAdminDashboard() // Refresh dashboard
      } else {
        this.uiManager.showNotification(result.error || 'Erreur lors de l\'approbation', 'error')
      }
    } catch (error) {
      console.error('Error approving hotel:', error)
      this.uiManager.showNotification('Erreur lors de l\'approbation', 'error')
    }
  }

  async rejectHotel(hotelId) {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cet hôtel ?')) {
      return
    }

    try {
      const result = await api.rejectHotel(hotelId)
      
      if (result.message) {
        this.uiManager.showNotification('Hôtel rejeté')
        this.loadAdminDashboard() // Refresh dashboard
      } else {
        this.uiManager.showNotification(result.error || 'Erreur lors du rejet', 'error')
      }
    } catch (error) {
      console.error('Error rejecting hotel:', error)
      this.uiManager.showNotification('Erreur lors du rejet', 'error')
    }
  }

  async deleteHotel(hotelId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cet hôtel ? Cette action est irréversible.')) {
      return
    }

    try {
      const result = await api.deleteHotel(hotelId)
      
      if (result.message) {
        this.uiManager.showNotification('Hôtel supprimé avec succès')
        this.loadAdminDashboard() // Refresh dashboard
      } else {
        this.uiManager.showNotification(result.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Error deleting hotel:', error)
      this.uiManager.showNotification('Erreur lors de la suppression', 'error')
    }
  }

  getStatusText(status) {
    const statusMap = {
      'en_attente': 'En attente',
      'valide': 'Validé',
      'refuse': 'Refusé'
    }
    return statusMap[status] || status
  }

  getHotelTypeText(type) {
    const typeMap = {
      'hotel': 'Hôtel',
      'apartment': 'Appartement',
      'house': 'Maison',
      'villa': 'Villa',
      'studio': 'Studio',
      'guesthouse': 'Maison d\'hôtes',
      'other': 'Autre'
    }
    return typeMap[type] || type
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WanderpeekSupabaseApp()
})