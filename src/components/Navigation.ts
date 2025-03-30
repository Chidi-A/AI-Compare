export class Navigation {
  private navContainer: HTMLElement | null;

  constructor() {
    this.navContainer = document.querySelector('.nav-container');
    this.initialize();
  }

  private initialize(): void {
    if (!this.navContainer) {
      console.error('Navigation container not found');
      return;
    }

    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleScroll(): void {
    if (!this.navContainer) return;

    if (window.scrollY > 20) {
      this.navContainer.classList.add('scrolled');
    } else {
      this.navContainer.classList.remove('scrolled');
    }
  }
}
