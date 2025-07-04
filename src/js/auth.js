// Authentication management with localStorage
export class AuthManager {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.onAuthChange = null;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    const userData = localStorage.getItem('wanderpeekUser');
    return userData ? JSON.parse(userData) : null;
  }

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.currentUser = { ...user };
      delete this.currentUser.password;
      localStorage.setItem('wanderpeekUser', JSON.stringify(this.currentUser));
      
      if (this.onAuthChange) {
        this.onAuthChange(this.currentUser);
      }
      
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, message: 'Email ou mot de passe incorrect' };
  }

  register(name, email, password) {
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Un compte existe déjà avec cet email' };
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      reservations: []
    };

    users.push(newUser);
    localStorage.setItem('wanderpeekUsers', JSON.stringify(users));

    return this.login(email, password);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('wanderpeekUser');
    
    if (this.onAuthChange) {
      this.onAuthChange(null);
    }
  }

  getUsers() {
    const users = localStorage.getItem('wanderpeekUsers');
    return users ? JSON.parse(users) : [];
  }

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
      localStorage.setItem('wanderpeekUsers', JSON.stringify(users));
      
      this.currentUser.reservations = users[userIndex].reservations;
      localStorage.setItem('wanderpeekUser', JSON.stringify(this.currentUser));
      
      return { success: true, reservation };
    }
    
    return { success: false, message: 'Erreur lors de la sauvegarde' };
  }

  getUserReservations() {
    if (!this.isLoggedIn()) {
      return [];
    }
    
    return this.currentUser.reservations || [];
  }

  onAuthStateChange(callback) {
    this.onAuthChange = callback;
  }
}