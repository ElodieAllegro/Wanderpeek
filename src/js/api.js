// API service for communicating with Symfony backend
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8000/api'; // Changed from https to http
    this.token = localStorage.getItem('auth_token');
    this.useMockData = false; // Flag to determine if we should use mock data
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Mock data for development when backend is unavailable
  getMockListings() {
    return [
      {
        id: 1,
        title: "Appartement moderne à Paris",
        category: "apartment",
        description: "Magnifique appartement au cœur de Paris avec vue sur la Seine",
        pricePerNight: 120,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        address: "123 Rue de Rivoli",
        city: "Paris",
        postalCode: "75001",
        country: "France",
        amenities: ["wifi", "kitchen", "parking"],
        images: ["https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg"],
        status: "approved"
      },
      {
        id: 2,
        title: "Villa avec piscine à Nice",
        category: "house",
        description: "Villa luxueuse avec piscine privée et vue sur la mer",
        pricePerNight: 250,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        address: "456 Promenade des Anglais",
        city: "Nice",
        postalCode: "06000",
        country: "France",
        amenities: ["wifi", "pool", "parking", "kitchen"],
        images: ["https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg"],
        status: "approved"
      },
      {
        id: 3,
        title: "Chalet en montagne",
        category: "chalet",
        description: "Chalet authentique dans les Alpes françaises",
        pricePerNight: 180,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        address: "789 Route de la Montagne",
        city: "Chamonix",
        postalCode: "74400",
        country: "France",
        amenities: ["wifi", "fireplace", "parking"],
        images: ["https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg"],
        status: "approved"
      }
    ];
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API Error:', error);
      
      // If it's a network error and we're trying to get listings, use mock data
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        console.warn('Backend unavailable, using mock data for development');
        this.useMockData = true;
        
        // Handle specific endpoints with mock data
        if (endpoint.includes('/listings')) {
          return this.getMockListings();
        }
        
        // For other endpoints, return empty arrays or default responses
        if (endpoint.includes('/reservations')) {
          return [];
        }
        
        if (endpoint.includes('/messages')) {
          return [];
        }
        
        if (endpoint.includes('/stats')) {
          return {
            totalListings: 3,
            totalUsers: 10,
            totalReservations: 5,
            pendingListings: 1
          };
        }
      }
      
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    if (this.useMockData) {
      // Mock login for development
      const mockToken = 'mock-jwt-token-' + Date.now();
      return {
        token: mockToken,
        user: {
          id: 1,
          email: email,
          firstName: 'John',
          lastName: 'Doe',
          roles: ['ROLE_USER']
        }
      };
    }
    
    return this.request('/login_check', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    if (this.useMockData) {
      // Mock registration for development
      const mockToken = 'mock-jwt-token-' + Date.now();
      return {
        token: mockToken,
        user: {
          id: 2,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: ['ROLE_USER']
        }
      };
    }
    
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Listings methods
  async getListings(filters = {}) {
    if (this.useMockData) {
      let listings = this.getMockListings();
      
      // Apply basic filtering for mock data
      if (filters.category) {
        listings = listings.filter(listing => listing.category === filters.category);
      }
      
      if (filters.city) {
        listings = listings.filter(listing => 
          listing.city.toLowerCase().includes(filters.city.toLowerCase())
        );
      }
      
      if (filters.minPrice) {
        listings = listings.filter(listing => listing.pricePerNight >= parseFloat(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        listings = listings.filter(listing => listing.pricePerNight <= parseFloat(filters.maxPrice));
      }
      
      if (filters.minGuests) {
        listings = listings.filter(listing => listing.maxGuests >= parseInt(filters.minGuests));
      }
      
      if (filters.limit) {
        listings = listings.slice(0, parseInt(filters.limit));
      }
      
      return listings;
    }
    
    const params = new URLSearchParams(filters);
    return this.request(`/listings?${params}`);
  }

  async getListing(id) {
    if (this.useMockData) {
      const listings = this.getMockListings();
      return listings.find(listing => listing.id == id) || null;
    }
    
    return this.request(`/listings/${id}`);
  }

  async createListing(listingData) {
    if (this.useMockData) {
      // Mock creation - just return success
      return {
        id: Date.now(),
        ...listingData,
        status: 'pending'
      };
    }
    
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id, listingData) {
    if (this.useMockData) {
      // Mock update - just return success
      return {
        id: id,
        ...listingData
      };
    }
    
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id) {
    if (this.useMockData) {
      // Mock deletion - just return success
      return { success: true };
    }
    
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // User listings
  async getUserListings() {
    if (this.useMockData) {
      // Return a subset of mock listings as user's listings
      return this.getMockListings().slice(0, 2);
    }
    
    return this.request('/user/listings');
  }

  // Reservations methods
  async getReservations() {
    if (this.useMockData) {
      return [
        {
          id: 1,
          listingId: 1,
          listingTitle: "Appartement moderne à Paris",
          checkIn: "2024-02-15",
          checkOut: "2024-02-20",
          guests: 2,
          totalPrice: 600,
          status: "confirmed",
          type: "made"
        },
        {
          id: 2,
          listingId: 2,
          listingTitle: "Villa avec piscine à Nice",
          checkIn: "2024-03-01",
          checkOut: "2024-03-05",
          guests: 4,
          totalPrice: 1000,
          status: "pending",
          type: "received"
        }
      ];
    }
    
    return this.request('/reservations');
  }

  async createReservation(reservationData) {
    if (this.useMockData) {
      return {
        id: Date.now(),
        ...reservationData,
        status: 'pending'
      };
    }
    
    return this.request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  async updateReservationStatus(id, status) {
    if (this.useMockData) {
      return { id, status };
    }
    
    return this.request(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Messages methods
  async getMessages() {
    if (this.useMockData) {
      return [];
    }
    
    return this.request('/messages');
  }

  async sendMessage(messageData) {
    if (this.useMockData) {
      return {
        id: Date.now(),
        ...messageData,
        createdAt: new Date().toISOString()
      };
    }
    
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(id) {
    if (this.useMockData) {
      return { id, read: true };
    }
    
    return this.request(`/messages/${id}/read`, {
      method: 'PATCH',
    });
  }

  // Admin methods
  async getPendingListings() {
    if (this.useMockData) {
      return [
        {
          id: 4,
          title: "Nouveau listing en attente",
          category: "apartment",
          city: "Lyon",
          pricePerNight: 90,
          status: "pending",
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    return this.request('/admin/listings/pending');
  }

  async approveListing(id) {
    if (this.useMockData) {
      return { id, status: 'approved' };
    }
    
    return this.request(`/admin/listings/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectListing(id) {
    if (this.useMockData) {
      return { id, status: 'rejected' };
    }
    
    return this.request(`/admin/listings/${id}/reject`, {
      method: 'PATCH',
    });
  }

  async getStats() {
    if (this.useMockData) {
      return {
        totalListings: 3,
        totalUsers: 15,
        totalReservations: 8,
        pendingListings: 1,
        revenue: 2500
      };
    }
    
    return this.request('/admin/stats');
  }

  // User profile
  async getProfile() {
    if (this.useMockData) {
      return {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+33 1 23 45 67 89',
        bio: 'Passionné de voyages et d\'hospitalité'
      };
    }
    
    return this.request('/profile');
  }

  async updateProfile(profileData) {
    if (this.useMockData) {
      return {
        id: 1,
        ...profileData
      };
    }
    
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export default new ApiService();