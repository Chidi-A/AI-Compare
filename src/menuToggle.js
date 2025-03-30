// Add this to your main.ts or create a new file
document.querySelector('.nav-menu-button')?.addEventListener('click', () => {
  document.querySelector('.nav')?.classList.toggle('mobile-menu-active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav')) {
    document.querySelector('.nav')?.classList.remove('mobile-menu-active');
  }
});
