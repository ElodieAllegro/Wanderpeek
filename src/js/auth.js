// Authentication management with localStorage
export class AuthManager {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.onAuthChange = null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userData = localStorage.getItem('bookiUser');
    return userData ? JSON.parse(userData) : null;
  }

  // Login user
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.currentUser = { ...user };
      delete this.currentUser.password; // Don't store password in current session
      localStorage.setItem('bookiUser', JSON.stringify(this.currentUser));
      
      if (this.onAuthChange) {
        this.onAuthChange(this.currentUser);
      }
      
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, message: 'Email ou mot de passe incorrect' };
  }

  // Register new user
  register(name, email, password) {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Un compte existe déjà avec cet email' };
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      reservations: []
    };

    users.push(newUser);
    localStorage.setItem('bookiUsers', JSON.stringify(users));

    // Auto login after registration
    return this.login(email, password);
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem('bookiUser');
    
    if (this.onAuthChange) {
      this.onAuthChange(null);
    }
  }

  // Get all users from localStorage
  getUsers() {
    const users = localStorage.getItem('bookiUsers');
    return users ? JSON.parse(users) : [];
  }

  // Update user data
  updateUser(userData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...userData };
      localStorage.setItem('bookiUsers', JSON.stringify(users));
      
      // Update current user session
      this.currentUser = { ...this.currentUser, ...userData };
      localStorage.setItem('bookiUser', JSON.stringify(this.currentUser));
      
      if (this.onAuthChange) {
        this.onAuthChange(this.currentUser);
      }
    }
  }

  // Add reservation to user
  addReservation(reservationData) {
    if (!this.isLoggedIn()) {
      return { success: false, message: 'Vous devez être connecté pour réserver' };
    }

    const reservation = {
      id: Date.now(),
      ...reservationData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex !== -1) {
      if (!users[userIndex].reservations) {
        users[userIndex].reservations = [];
      }
      
      users[userIndex].reservations.push(reservation);
      localStorage.setItem('bookiUsers', JSON.stringify(users));
      
      // Update current user session
      this.currentUser.reservations = users[userIndex].reservations;
      localStorage.setItem('bookiUser', JSON.stringify(this.currentUser));
      
      return { success: true, reservation };
    }
    
    return { success: false, message: 'Erreur lors de la sauvegarde' };
  }

  // Get user reservations
  getUserReservations() {
    if (!this.isLoggedIn()) {
      return [];
    }
    
    return this.currentUser.reservations || [];
  }

  // Set auth change callback
  onAuthStateChange(callback) {
    this.onAuthChange = callback;
  }
}