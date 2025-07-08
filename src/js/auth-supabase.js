// Supabase-based authentication manager
import { api } from './supabase.js'

export class SupabaseAuthManager {
  constructor() {
    this.currentUser = this.getCurrentUser()
    this.onAuthChange = null
  }

  isLoggedIn() {
    return this.currentUser !== null
  }

  getCurrentUser() {
    const userData = localStorage.getItem('wanderpeekUser')
    return userData ? JSON.parse(userData) : null
  }

  async login(email, password) {
    try {
      const result = await api.login(email, password)
      
      if (result.user) {
        this.currentUser = result.user
        localStorage.setItem('wanderpeekUser', JSON.stringify(this.currentUser))
        
        if (this.onAuthChange) {
          this.onAuthChange(this.currentUser)
        }
        
        return { success: true, user: this.currentUser }
      } else {
        return { success: false, message: result.error || 'Erreur de connexion' }
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' }
    }
  }

  async register(name, email, password, phone = null) {
    try {
      const result = await api.register(email, password, name, phone)
      
      if (result.user) {
        this.currentUser = result.user
        localStorage.setItem('wanderpeekUser', JSON.stringify(this.currentUser))
        
        if (this.onAuthChange) {
          this.onAuthChange(this.currentUser)
        }
        
        return { success: true, user: this.currentUser }
      } else {
        return { success: false, message: result.error || 'Erreur d\'inscription' }
      }
    } catch (error) {
      return { success: false, message: 'Erreur d\'inscription' }
    }
  }

  logout() {
    this.currentUser = null
    localStorage.removeItem('wanderpeekUser')
    
    if (this.onAuthChange) {
      this.onAuthChange(null)
    }
  }

  async addReservation(reservationData) {
    if (!this.isLoggedIn()) {
      return { success: false, message: 'Vous devez être connecté pour réserver' }
    }

    try {
      const result = await api.createReservation({
        ...reservationData,
        clientId: this.currentUser.id
      })

      if (result.id) {
        return { success: true, reservation: result }
      } else {
        return { success: false, message: result.error || 'Erreur lors de la réservation' }
      }
    } catch (error) {
      return { success: false, message: 'Erreur lors de la réservation' }
    }
  }

  async getUserReservations() {
    if (!this.isLoggedIn()) {
      return []
    }
    
    try {
      const reservations = await api.getClientReservations(this.currentUser.id)
      return Array.isArray(reservations) ? reservations : []
    } catch (error) {
      return []
    }
  }

  onAuthStateChange(callback) {
    this.onAuthChange = callback
  }

  // Admin functions
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin'
  }

  // Hotelier functions
  isHotelier() {
    return this.currentUser && this.currentUser.role === 'hotelier'
  }

  // Client functions
  isClient() {
    return this.currentUser && this.currentUser.role === 'client'
  }
}