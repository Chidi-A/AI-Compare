// Add this to your main.ts file

document.addEventListener('DOMContentLoaded', () => {
  // Set up infinite marquee
  setupMarquee();
});

function setupMarquee() {
  const marqueeContent = document.getElementById('marquee-content');
  if (!marqueeContent) return;

  // Clone the content MULTIPLE TIMES to ensure we have enough content
  // This helps create a more seamless appearance
  const clone1 = marqueeContent.cloneNode(true) as HTMLElement;
  clone1.setAttribute('aria-hidden', 'true');
  document.querySelector('.marquee-track')?.appendChild(clone1);

  // Add a second clone for even more smoothness
  const clone2 = marqueeContent.cloneNode(true) as HTMLElement;
  clone2.setAttribute('aria-hidden', 'true');
  document.querySelector('.marquee-track')?.appendChild(clone2);

  function adjustMarqueeAnimation() {
    // Calculate total width of a single content block
    const contentWidth = marqueeContent.offsetWidth;

    // Set the animation duration proportional to the content width
    // Lower divisor = faster speed
    const duration = contentWidth / 30;

    // Apply to all marquee content elements
    document.querySelectorAll('.marquee-content').forEach((element) => {
      (element as HTMLElement).style.animationDuration = `${duration}s`;
    });

    // Update the keyframe animation to use percentage-based translation
    // This is critical - we want to animate based on the NEGATIVE width of ONE content block
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
      @keyframes marquee {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-${contentWidth}px);
        }
      }
    `;

    // Remove any previously added animation styles
    const oldStyleSheet = document.querySelector('style[data-marquee]');
    if (oldStyleSheet) {
      oldStyleSheet.remove();
    }

    // Add the new animation
    styleSheet.setAttribute('data-marquee', 'true');
    document.head.appendChild(styleSheet);
  }

  // Initial setup
  adjustMarqueeAnimation();

  // Update on resize
  window.addEventListener('resize', adjustMarqueeAnimation);

  // Pause on hover functionality
  document
    .querySelector('.marquee-track')
    ?.addEventListener('mouseenter', () => {
      document.querySelectorAll('.marquee-content').forEach((element) => {
        (element as HTMLElement).style.animationPlayState = 'paused';
      });
    });

  document
    .querySelector('.marquee-track')
    ?.addEventListener('mouseleave', () => {
      document.querySelectorAll('.marquee-content').forEach((element) => {
        (element as HTMLElement).style.animationPlayState = 'running';
      });
    });
}
