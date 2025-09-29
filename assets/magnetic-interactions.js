// Magnetic Interactions & Advanced Luxury Effects
// Inspired by Trae.ai's sophisticated interactions

document.addEventListener('DOMContentLoaded', function() {
  initMagneticElements();
  initParallaxEffects();
  initAdvancedHoverEffects();
  initStaggerAnimations();
  initLuxuryTooltips();
});

// Enhanced magnetic interactions for 3D elements
function initMagneticElements() {
  const magneticElements = document.querySelectorAll('.magnetic-element, .btn, .card, .three-product-viewer, .gallery-item');
  
  magneticElements.forEach(element => {
    element.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Enhanced strength for 3D elements
      const is3DElement = this.classList.contains('three-product-viewer') || 
                         this.classList.contains('gallery-item') ||
                         this.classList.contains('product-3d-item');
      
      const strength = is3DElement ? 0.4 : 0.3; // Increased strength for 3D elements
      const maxDistance = is3DElement ? 120 : 100; // Larger interaction area for 3D elements
      
      const distance = Math.sqrt(x * x + y * y);
      
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const moveX = x * strength * force;
        const moveY = y * strength * force;
        
        // Enhanced 3D transformations
        if (is3DElement) {
          const rotateX = (y * 0.1 * force);
          const rotateY = (x * 0.1 * force);
          this.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.08}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
          
          // Add glow effect for 3D elements
          if (this.classList.contains('three-product-viewer')) {
            this.style.boxShadow = `
              0 ${20 + force * 20}px ${40 + force * 20}px rgba(0, 0, 0, ${0.6 + force * 0.2}),
              0 ${8 + force * 8}px ${16 + force * 8}px rgba(0, 0, 0, ${0.4 + force * 0.2}),
              inset 0 1px 0 rgba(255, 255, 255, ${0.1 + force * 0.1})
            `;
          }
        } else {
          this.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.05})`;
        }
      }
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0px, 0px) scale(1) rotateX(0deg) rotateY(0deg)';
      
      // Reset box shadow for 3D elements
      if (this.classList.contains('three-product-viewer')) {
        this.style.boxShadow = '';
      }
    });
    
    // Add special handling for 3D viewer interactions
    if (element.classList.contains('three-product-viewer')) {
      element.addEventListener('mouseenter', function() {
        // Trigger auto-rotation on hover if available
        if (this.threeViewer && this.threeViewer.controls) {
          this.threeViewer.controls.autoRotate = true;
        }
        
        // Add liquid overlay if it exists
        const liquidOverlay = this.querySelector('.liquid-overlay');
        if (liquidOverlay) {
          liquidOverlay.style.opacity = '1';
        }
      });
      
      element.addEventListener('mouseleave', function() {
        // Reset auto-rotation
        if (this.threeViewer && this.threeViewer.controls) {
          this.threeViewer.controls.autoRotate = this.threeViewer.options.autoRotate;
        }
        
        // Hide liquid overlay
        const liquidOverlay = this.querySelector('.liquid-overlay');
        if (liquidOverlay) {
          liquidOverlay.style.opacity = '0';
        }
      });
    }
  });
}

// Parallax scroll effects
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('.parallax-element');
  
  if (parallaxElements.length === 0) return;
  
  let ticking = false;
  
  function updateParallax() {
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach((element, index) => {
      const speed = element.dataset.speed || 0.5;
      const yPos = -(scrollTop * speed);
      const rotate = scrollTop * 0.01;
      
      element.style.transform = `translate3d(0, ${yPos}px, 0) rotate(${rotate}deg)`;
    });
    
    ticking = false;
  }
  
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestTick);
}

// Advanced hover effects with 3D transforms
function initAdvancedHoverEffects() {
  const hoverElements = document.querySelectorAll('.card, .btn, .interactive-element');
  
  hoverElements.forEach(element => {
    element.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * -10; // Max 10 degrees
      const rotateY = (x - centerX) / centerX * 10;
      
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

// Stagger animations on scroll
function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('.stagger-container');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animate');
          }, index * 100);
        });
      }
    });
  }, {
    threshold: 0.1
  });
  
  staggerContainers.forEach(container => {
    observer.observe(container);
  });
}

// Luxury tooltips with dynamic positioning
function initLuxuryTooltips() {
  const tooltipElements = document.querySelectorAll('.tooltip-luxury');
  
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', function(e) {
      const tooltip = this.getAttribute('data-tooltip');
      if (!tooltip) return;
      
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip-dynamic';
      tooltipEl.textContent = tooltip;
      tooltipEl.style.cssText = `
        position: absolute;
        background: rgba(15, 23, 42, 0.95);
        color: rgb(248, 250, 252);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.8rem;
        white-space: nowrap;
        z-index: 10000;
        pointer-events: none;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      
      document.body.appendChild(tooltipEl);
      
      // Position tooltip
      const rect = this.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      let top = rect.top - tooltipRect.height - 8;
      
      // Adjust if tooltip goes off screen
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      if (top < 10) {
        top = rect.bottom + 8;
      }
      
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
      
      // Animate in
      requestAnimationFrame(() => {
        tooltipEl.style.opacity = '1';
        tooltipEl.style.transform = 'translateY(0)';
      });
      
      this._tooltip = tooltipEl;
    });
    
    element.addEventListener('mouseleave', function() {
      if (this._tooltip) {
        this._tooltip.style.opacity = '0';
        this._tooltip.style.transform = 'translateY(10px)';
        setTimeout(() => {
          if (this._tooltip && this._tooltip.parentNode) {
            this._tooltip.parentNode.removeChild(this._tooltip);
          }
          this._tooltip = null;
        }, 300);
      }
    });
  });
}

// Smooth scroll with easing
function smoothScrollTo(target, duration = 1000) {
  const targetElement = document.querySelector(target);
  if (!targetElement) return;
  
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;
  
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  function easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }
  
  requestAnimationFrame(animation);
}

// Initialize smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = this.getAttribute('href');
    smoothScrollTo(target);
  });
});

// Cursor trail effect (optional luxury enhancement)
function initCursorTrail() {
  const trail = [];
  const trailLength = 10;
  
  for (let i = 0; i < trailLength; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    dot.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: rgba(59, 130, 246, ${0.8 - i * 0.08});
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.1s ease;
    `;
    document.body.appendChild(dot);
    trail.push(dot);
  }
  
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function animateTrail() {
    let x = mouseX;
    let y = mouseY;
    
    trail.forEach((dot, index) => {
      const nextDot = trail[index + 1] || trail[0];
      
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      
      if (nextDot) {
        x += (parseFloat(nextDot.style.left) - x) * 0.3;
        y += (parseFloat(nextDot.style.top) - y) * 0.3;
      }
    });
    
    requestAnimationFrame(animateTrail);
  }
  
  animateTrail();
}

// Initialize cursor trail on desktop only
if (window.innerWidth > 768 && !('ontouchstart' in window)) {
  initCursorTrail();
}

// Performance monitoring
let performanceWarning = false;

function checkPerformance() {
  const now = performance.now();
  if (now > 16.67 && !performanceWarning) { // 60fps threshold
    console.warn('Performance warning: Consider reducing animations');
    performanceWarning = true;
  }
}

// Throttle performance checks
setInterval(checkPerformance, 1000);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  document.querySelectorAll('.cursor-trail-dot, .tooltip-dynamic').forEach(el => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
});