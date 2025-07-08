// Supabase client configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API helper functions
export class SupabaseAPI {
  constructor() {
    this.baseUrl = `${supabaseUrl}/functions/v1`
    this.headers = {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    }
  }

  // Authentication
  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ email, password })
    })
    return response.json()
  }

  async register(email, password, name, phone = null, role = 'client') {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ email, password, name, phone, role })
    })
    return response.json()
  }

  // Hotels
  async getHotels(filters = {}) {
    const params = new URLSearchParams()
    if (filters.city) params.append('city', filters.city)
    if (filters.popular) params.append('popular', 'true')
    if (filters.status) params.append('status', filters.status)

    const response = await fetch(`${this.baseUrl}/hotels?${params}`, {
      headers: this.headers
    })
    return response.json()
  }

  async getHotel(id) {
    const response = await fetch(`${this.baseUrl}/hotels/${id}`, {
      headers: this.headers
    })
    return response.json()
  }

  async proposeHotel(hotelData) {
    const response = await fetch(`${this.baseUrl}/hotels/propose`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(hotelData)
    })
    return response.json()
  }

  // Activities
  async getActivities(city = null) {
    const params = city ? `?city=${encodeURIComponent(city)}` : ''
    const response = await fetch(`${this.baseUrl}/activities${params}`, {
      headers: this.headers
    })
    return response.json()
  }

  // Reservations
  async createReservation(reservationData) {
    const response = await fetch(`${this.baseUrl}/reservations`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(reservationData)
    })
    return response.json()
  }

  async getClientReservations(clientId) {
    const response = await fetch(`${this.baseUrl}/reservations/client/${clientId}`, {
      headers: this.headers
    })
    return response.json()
  }

  async getHotelReservations(hotelId) {
    const response = await fetch(`${this.baseUrl}/reservations/hotel/${hotelId}`, {
      headers: this.headers
    })
    return response.json()
  }

  async updateReservationStatus(reservationId, status) {
    const response = await fetch(`${this.baseUrl}/reservations/${reservationId}/status`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ status })
    })
    return response.json()
  }

  // Admin functions
  async getAdminDashboard() {
    const response = await fetch(`${this.baseUrl}/admin/dashboard`, {
      headers: this.headers
    })
    return response.json()
  }

  async getPendingHotels() {
    const response = await fetch(`${this.baseUrl}/admin/hotels/pending`, {
      headers: this.headers
    })
    return response.json()
  }

  async getAllHotels() {
    const response = await fetch(`${this.baseUrl}/admin/hotels`, {
      headers: this.headers
    })
    return response.json()
  }

  async approveHotel(hotelId, updateData = {}) {
    const response = await fetch(`${this.baseUrl}/admin/hotels/${hotelId}/approve`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(updateData)
    })
    return response.json()
  }

  async rejectHotel(hotelId) {
    const response = await fetch(`${this.baseUrl}/admin/hotels/${hotelId}/reject`, {
      method: 'PUT',
      headers: this.headers
    })
    return response.json()
  }

  async deleteHotel(hotelId) {
    const response = await fetch(`${this.baseUrl}/admin/hotels/${hotelId}`, {
      method: 'DELETE',
      headers: this.headers
    })
    return response.json()
  }

  // Hotelier functions
  async getHotelierDashboard(userId) {
    const response = await fetch(`${this.baseUrl}/hotelier/dashboard/${userId}`, {
      headers: this.headers
    })
    return response.json()
  }

  async getHotelAvailability(hotelId, startDate = null, endDate = null) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await fetch(`${this.baseUrl}/hotelier/hotels/${hotelId}/availability?${params}`, {
      headers: this.headers
    })
    return response.json()
  }

  async updateHotelAvailability(hotelId, availabilityData) {
    const response = await fetch(`${this.baseUrl}/hotelier/hotels/${hotelId}/availability`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(availabilityData)
    })
    return response.json()
  }
}

export const api = new SupabaseAPI()