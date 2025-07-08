// Supabase client configuration
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// API helper functions
export class SupabaseAPI {
  constructor() {
    this.baseUrl = `${supabaseUrl}/rest/v1`
    this.headers = {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    }
  }

  // Authentication
  async login(email, password) {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  }

  async register(email, password, name, phone = null, role = 'client') {
    const response = await fetch(`${supabaseUrl}/functions/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, phone, role })
    })
    return response.json()
  }

  // Hotels
  async getHotels(filters = {}) {
    let hotelQuery = supabase
      .from('hotels')
      .select('*')
      .eq('status', 'valide')
      .order('popularity', { ascending: false })

    if (filters.city) {
      hotelQuery = hotelQuery.eq('city', filters.city)
    }

    if (filters.popular) {
      hotelQuery = hotelQuery.limit(3)
    }

    console.log('🌐 Requête Supabase hotels avec filtres:', filters)
    
    const { data: hotels, error } = await hotelQuery
    
    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return []
    }
    
    if (!hotels || hotels.length === 0) {
      return []
    }

    // Récupérer les images pour chaque hôtel
    const hotelsWithImages = await Promise.all(
      hotels.map(async (hotel) => {
        const { data: images } = await supabase
          .from('hotel_images')
          .select('*')
          .eq('hotel_id', hotel.id)
          .order('display_order', { ascending: true })

        return {
          ...hotel,
          images: images || [],
          image: images && images.length > 0 
            ? images.find(img => img.is_primary)?.image_url || images[0].image_url 
            : null
        }
      })
    )
    
    console.log('📡 Réponse Supabase hotels avec images:', hotelsWithImages)
    return hotelsWithImages
  }

  async getHotel(id) {
    // Récupérer l'hôtel
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single()

    if (hotelError) {
      console.error('❌ Erreur lors de la récupération de l\'hôtel:', hotelError)
      return { error: hotelError.message }
    }

    // Récupérer les images de l'hôtel
    const { data: images } = await supabase
      .from('hotel_images')
      .select('*')
      .eq('hotel_id', id)
      .order('display_order', { ascending: true })

    // Retourner l'hôtel avec ses images
    return {
      ...hotel,
      images: images || [],
      image: images && images.length > 0 
        ? images.find(img => img.is_primary)?.image_url || images[0].image_url 
        : null
    }
  }

  async proposeHotel(hotelData) {
    const response = await fetch(`${supabaseUrl}/functions/v1/hotels/propose`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hotelData)
    })
    return response.json()
  }

  // Activities
  async getActivities(city = null) {
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })

    if (city) {
      query = query.eq('city', city)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des activités:', error)
      return []
    }

    return data || []
  }

  // Reservations
  async createReservation(reservationData) {
    const response = await fetch(`${supabaseUrl}/functions/v1/reservations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData)
    })
    return response.json()
  }

  async getClientReservations(clientId) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        hotels (
          id,
          name,
          city,
          image
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erreur lors de la récupération des réservations:', error)
      return []
    }

    return data || []
  }

  async getHotelReservations(hotelId) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        users (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('hotel_id', hotelId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erreur lors de la récupération des réservations:', error)
      return []
    }

    return data || []
  }

  async updateReservationStatus(reservationId, status) {
    const response = await fetch(`${supabaseUrl}/functions/v1/reservations/${reservationId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    })
    return response.json()
  }

  // Admin functions
  async getAdminDashboard() {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  async getPendingHotels() {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin/hotels/pending`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  async getAllHotels() {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin/hotels`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  async approveHotel(hotelId, updateData = {}) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin/hotels/${hotelId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })
    return response.json()
  }

  async rejectHotel(hotelId) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin/hotels/${hotelId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  async deleteHotel(hotelId) {
    const response = await fetch(`${supabaseUrl}/functions/v1/admin/hotels/${hotelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  // Hotelier functions
  async getHotelierDashboard(userId) {
    const response = await fetch(`${supabaseUrl}/functions/v1/hotelier/dashboard/${userId}`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  async getHotelAvailability(hotelId, startDate = null, endDate = null) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await fetch(`${supabaseUrl}/functions/v1/hotelier/hotels/${hotelId}/availability?${params}`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }

  async updateHotelAvailability(hotelId, availabilityData) {
    const response = await fetch(`${supabaseUrl}/functions/v1/hotelier/hotels/${hotelId}/availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(availabilityData)
    })
    return response.json()
  }
}

export const api = new SupabaseAPI()