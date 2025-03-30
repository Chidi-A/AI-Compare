import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initialize the browser demo animation
export function initBrowserDemoAnimation() {
  // Get the browser demo element
  const browserDemo = document.querySelector('.browser-demo') as HTMLElement;
  const browserFrame = document.querySelector('.browser-frame') as HTMLElement;

  if (!browserDemo || !browserFrame) return;

  // Check if the device is mobile (screen width less than 768px)
  const isMobile = window.innerWidth < 768;

  // Set initial state - blurred and slightly scaled down
  gsap.set(browserFrame, {
    filter: 'blur(10px)',
    opacity: 0,
    scale: 0.9,
  });

  // First animation: fade in and remove blur
  gsap.to(browserFrame, {
    duration: 1.2,
    filter: 'blur(0px)',
    opacity: 1,
    scale: isMobile ? 1 : 0.95, // Don't scale down on mobile
    width: isMobile ? '100%' : '90%', // Full width on mobile
    height: isMobile ? 'auto' : '90%', // Auto height on mobile
    ease: 'power2.out',
    delay: 0.5,
  });

  // Only add scroll-triggered growth animation for non-mobile devices
  if (!isMobile) {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '.hero-header',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          markers: false,
          immediateRender: true,
        },
      })
      .to(browserFrame, {
        width: '105%',
        height: '105%',
        scale: 1,
        y: -15,
        ease: 'power1.out',
        duration: 0.5,
      })
      .to(browserFrame, {
        width: '105%',
        height: '105%',
        scale: 1.15,
        y: 30,
        ease: 'power1.out',
        duration: 1.5,
      });
  }
}

// Add window resize handler to handle orientation changes
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

document.addEventListener('DOMContentLoaded', () => {
  // Force scroll to top on page load
  window.scrollTo(0, 0);

  // Initialize the animation
  setTimeout(initBrowserDemoAnimation, 100);

  // Refresh ScrollTrigger after a slight delay to ensure everything is loaded
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 500);
});
