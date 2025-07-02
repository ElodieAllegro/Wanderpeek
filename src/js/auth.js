// Authentication management
import api from './api.js';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.onAuthChange = null;
    this.init();
  }

  async init() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const user = await api.getProfile();
        this.currentUser = user;
        if (this.onAuthChange) {
          this.onAuthChange(this.currentUser);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        this.logout();
      }
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Check if user is admin
  isAdmin() {
    return this.currentUser && this.currentUser.roles.includes('ROLE_ADMIN');
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Login user
  async login(email, password) {
    try {
      const response = await api.login(email, password);
      
      if (response.token) {
        api.setToken(response.token);
        this.currentUser = response.user;
        
        if (this.onAuthChange) {
          this.onAuthChange(this.currentUser);
        }
        
        return { success: true, user: this.currentUser };
      }
      
      return { success: false, message: 'Réponse invalide du serveur' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await api.register(userData);
      
      if (response.token) {
        api.setToken(response.token);
        this.currentUser = response.user;
        
        if (this.onAuthChange) {
          this.onAuthChange(this.currentUser);
        }
        
        return { success: true, user: this.currentUser };
      }
      
      return { success: false, message: 'Réponse invalide du serveur' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Logout user
  logout() {
    this.currentUser = null;
    api.removeToken();
    
    if (this.onAuthChange) {
      this.onAuthChange(null);
    }
  }

  // Set auth change callback
  onAuthStateChange(callback) {
    this.onAuthChange = callback;
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const updatedUser = await api.updateProfile(profileData);
      this.currentUser = updatedUser;
      
      if (this.onAuthChange) {
        this.onAuthChange(this.currentUser);
      }
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}