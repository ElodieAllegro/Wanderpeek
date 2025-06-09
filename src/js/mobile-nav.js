export class MobileNavHandler {
  constructor() {
    this.navToggle = document.querySelector('.nav-toggle');
    this.navLinks = document.querySelector('.nav-links');
    this.setupEvents();
  }

  setupEvents() {
    if (this.navToggle && this.navLinks) {
      this.navToggle.addEventListener('click', () => {
        this.toggleMenu();
      });

      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          this.closeMenu();
        });
      });
    }
  }

  toggleMenu() {
    this.navLinks.classList.toggle('open');
  }

  closeMenu() {
    this.navLinks.classList.remove('open');
  }
} 