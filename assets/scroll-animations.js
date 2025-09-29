// Scroll-triggered animations for luxury aesthetic
// Inspired by Trae.ai's refined interactions

document.addEventListener('DOMContentLoaded', function() {
  // Initialize scroll reveal animations
  initScrollReveal();
  
  // Initialize particle interactions
  initParticleInteractions();
  
  // Initialize luxury hover effects
  initLuxuryHoverEffects();
});

function initScrollReveal() {
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= 
      (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };

  const elementOutofView = (el) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop > 
      (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  const displayScrollElement = (element) => {
    element.classList.add('revealed');
  };

  const hideScrollElement = (element) => {
    element.classList.remove('revealed');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.25)) {
        displayScrollElement(el);
      } else if (elementOutofView(el)) {
        hideScrollElement(el);
      }
    });
  };

  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });

  // Initial check
  handleScrollAnimation();
}

function initParticleInteractions() {
  const particles = document.querySelectorAll('.particle');
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    particles.forEach((particle, index) => {
      const rect = particle.getBoundingClientRect();
      const particleX = rect.left + rect.width / 2;
      const particleY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2)
      );
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        const angle = Math.atan2(mouseY - particleY, mouseX - particleX);
        
        particle.style.transform = `translate(${Math.cos(angle) * force * 20}px, ${Math.sin(angle) * force * 20}px) scale(${1 + force * 0.5})`;
        particle.style.opacity = Math.min(1, 0.3 + force * 0.7);
      } else {
        particle.style.transform = 'translate(0, 0) scale(1)';
        particle.style.opacity = '0.3';
      }
    });
  });
}

function initLuxuryHoverEffects() {
  const interactiveElements = document.querySelectorAll('.interactive-element');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) rotateX(5deg) scale(1.02)';
      this.style.boxShadow = '0 20px 40px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
      
      // Add ripple effect
      createRippleEffect(this);
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
      this.style.boxShadow = 'none';
    });
  });
}

function createRippleEffect(element) {
  const ripple = document.createElement('div');
  ripple.classList.add('ripple-effect');
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = '50%';
  ripple.style.top = '50%';
  ripple.style.transform = 'translate(-50%, -50%) scale(0)';
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.background = 'rgba(255, 255, 255, 0.1)';
  ripple.style.pointerEvents = 'none';
  ripple.style.animation = 'ripple 0.6s ease-out';
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }
  
  .scroll-reveal {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .scroll-reveal.revealed {
    opacity: 1;
    transform: translateY(0);
  }
  
  .interactive-element {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
  }
  
  .particle {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
document.head.appendChild(style);

// Smooth scroll behavior for luxury feel
document.documentElement.style.scrollBehavior = 'smooth';

// Add performance optimizations
let ticking = false;

function updateAnimations() {
  // Update any continuous animations here
  ticking = false;
}

function requestTick() {
  if (!ticking) {
    requestAnimationFrame(updateAnimations);
    ticking = true;
  }
}

// Throttle scroll events for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(requestTick, 10);
});

// Preload critical animations
window.addEventListener('load', () => {
  document.body.classList.add('animations-loaded');
});

// Add reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('reduced-motion');
}