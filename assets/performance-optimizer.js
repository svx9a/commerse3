/**
 * Performance Optimizer for O2O Theme 3D/AR Features
 * Handles lazy loading, resource management, and mobile optimizations
 */

class PerformanceOptimizer {
  constructor() {
    this.isLowEndDevice = this.detectLowEndDevice();
    this.isMobile = this.detectMobile();
    this.connectionSpeed = this.detectConnectionSpeed();
    this.observers = new Map();
    this.loadedResources = new Set();
    this.performanceMetrics = {
      loadTimes: [],
      renderTimes: [],
      memoryUsage: []
    };
    
    this.init();
  }
  
  init() {
    // Initialize performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup intersection observers for lazy loading
    this.setupLazyLoading();
    
    // Optimize based on device capabilities
    this.applyDeviceOptimizations();
    
    // Setup resource cleanup
    this.setupResourceCleanup();
    
    console.log('Performance Optimizer initialized', {
      isLowEndDevice: this.isLowEndDevice,
      isMobile: this.isMobile,
      connectionSpeed: this.connectionSpeed
    });
  }
  
  detectLowEndDevice() {
    // Check device memory (if available)
    if ('deviceMemory' in navigator) {
      return navigator.deviceMemory <= 4; // 4GB or less
    }
    
    // Check hardware concurrency
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency <= 2; // 2 cores or less
    }
    
    // Fallback: check user agent for known low-end devices
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndPatterns = [
      'android 4', 'android 5', 'android 6',
      'iphone 6', 'iphone 5', 'iphone 4',
      'samsung-sm-g', 'samsung-sm-j'
    ];
    
    return lowEndPatterns.some(pattern => userAgent.includes(pattern));
  }
  
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  detectConnectionSpeed() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow';
        case '3g':
          return 'medium';
        case '4g':
        default:
          return 'fast';
      }
    }
    
    return 'unknown';
  }
  
  setupPerformanceMonitoring() {
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('three.js') || entry.name.includes('.gltf') || entry.name.includes('.glb')) {
            this.performanceMetrics.loadTimes.push({
              resource: entry.name,
              duration: entry.duration,
              timestamp: Date.now()
            });
          }
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      
      // Monitor memory usage (if available)
      if ('memory' in performance) {
        setInterval(() => {
          this.performanceMetrics.memoryUsage.push({
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            timestamp: Date.now()
          });
          
          // Keep only last 50 measurements
          if (this.performanceMetrics.memoryUsage.length > 50) {
            this.performanceMetrics.memoryUsage.shift();
          }
        }, 5000);
      }
    }
  }
  
  setupLazyLoading() {
    // Intersection Observer for 3D viewers
    const viewerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadViewer(entry.target);
          viewerObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });
    
    // Observe all 3D viewers
    document.querySelectorAll('.three-product-viewer, .ar-product-viewer').forEach(viewer => {
      if (!viewer.dataset.loaded) {
        viewerObserver.observe(viewer);
      }
    });
    
    this.observers.set('viewer', viewerObserver);
  }
  
  async loadViewer(viewerElement) {
    const startTime = performance.now();
    
    try {
      // Mark as loading
      viewerElement.classList.add('loading');
      viewerElement.dataset.loaded = 'true';
      
      // Get optimization settings based on device
      const optimizations = this.getViewerOptimizations();
      
      // Apply optimizations to viewer element
      Object.assign(viewerElement.dataset, optimizations);
      
      // Initialize viewer based on type
      if (viewerElement.classList.contains('ar-product-viewer')) {
        await this.initializeARViewer(viewerElement, optimizations);
      } else {
        await this.initializeThreeViewer(viewerElement, optimizations);
      }
      
      // Record load time
      const loadTime = performance.now() - startTime;
      this.performanceMetrics.loadTimes.push({
        type: 'viewer',
        duration: loadTime,
        timestamp: Date.now()
      });
      
      viewerElement.classList.remove('loading');
      viewerElement.classList.add('loaded');
      
    } catch (error) {
      console.error('Failed to load viewer:', error);
      viewerElement.classList.remove('loading');
      viewerElement.classList.add('error');
      this.showFallback(viewerElement);
    }
  }
  
  getViewerOptimizations() {
    const baseOptimizations = {
      enableShadows: 'true',
      antialias: 'true',
      pixelRatio: '2'
    };
    
    // Low-end device optimizations
    if (this.isLowEndDevice) {
      return {
        ...baseOptimizations,
        enableShadows: 'false',
        antialias: 'false',
        pixelRatio: '1',
        maxLights: '2',
        shadowMapSize: '512',
        renderScale: '0.8'
      };
    }
    
    // Mobile optimizations
    if (this.isMobile) {
      return {
        ...baseOptimizations,
        pixelRatio: Math.min(window.devicePixelRatio, 2).toString(),
        maxLights: '3',
        shadowMapSize: '1024',
        renderScale: '0.9'
      };
    }
    
    // Slow connection optimizations
    if (this.connectionSpeed === 'slow') {
      return {
        ...baseOptimizations,
        enableShadows: 'false',
        maxLights: '2',
        preloadModels: 'false'
      };
    }
    
    return baseOptimizations;
  }
  
  async initializeThreeViewer(element, optimizations) {
    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      await this.loadThreeJS();
    }
    
    // Initialize with optimizations
    const viewer = new ThreeProductViewer(element, {
      ...optimizations,
      modelUrl: element.dataset.modelUrl,
      scale: parseFloat(element.dataset.scale) || 1,
      autoRotate: element.dataset.autoRotate === 'true'
    });
    
    element.threeViewer = viewer;
  }
  
  async initializeARViewer(element, optimizations) {
    // Check WebXR support
    const isARSupported = await this.checkARSupport();
    
    if (!isARSupported && this.isMobile) {
      // Fallback to regular 3D viewer on mobile without AR
      await this.initializeThreeViewer(element, optimizations);
      return;
    }
    
    // Initialize AR viewer
    const viewer = new ARProductViewer(element, {
      ...optimizations,
      modelUrl: element.dataset.modelUrl,
      scale: parseFloat(element.dataset.scale) || 1,
      enableAR: isARSupported
    });
    
    element.arViewer = viewer;
  }
  
  async checkARSupport() {
    if ('xr' in navigator) {
      try {
        return await navigator.xr.isSessionSupported('immersive-ar');
      } catch (error) {
        return false;
      }
    }
    return false;
  }
  
  async loadThreeJS() {
    return new Promise((resolve, reject) => {
      if (typeof THREE !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  showFallback(element) {
    const fallback = element.querySelector('.ar-fallback-image, .three-fallback-image');
    if (fallback) {
      fallback.style.display = 'block';
    } else {
      // Create a simple fallback
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'viewer-fallback';
      fallbackDiv.innerHTML = `
        <div class="fallback-content">
          <div class="fallback-icon">📦</div>
          <div class="fallback-text">3D viewer unavailable</div>
        </div>
      `;
      element.appendChild(fallbackDiv);
    }
  }
  
  setupResourceCleanup() {
    // Clean up resources when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAllViewers();
      } else {
        this.resumeAllViewers();
      }
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.disposeAllViewers();
    });
    
    // Memory pressure handling (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = performance.memory;
        const memoryUsageRatio = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
        
        if (memoryUsageRatio > 0.9) {
          console.warn('High memory usage detected, cleaning up resources');
          this.cleanupUnusedResources();
        }
      }, 10000);
    }
  }
  
  pauseAllViewers() {
    document.querySelectorAll('.three-product-viewer, .ar-product-viewer').forEach(element => {
      if (element.threeViewer && element.threeViewer.pause) {
        element.threeViewer.pause();
      }
      if (element.arViewer && element.arViewer.pause) {
        element.arViewer.pause();
      }
    });
  }
  
  resumeAllViewers() {
    document.querySelectorAll('.three-product-viewer, .ar-product-viewer').forEach(element => {
      if (element.threeViewer && element.threeViewer.resume) {
        element.threeViewer.resume();
      }
      if (element.arViewer && element.arViewer.resume) {
        element.arViewer.resume();
      }
    });
  }
  
  disposeAllViewers() {
    document.querySelectorAll('.three-product-viewer, .ar-product-viewer').forEach(element => {
      if (element.threeViewer && element.threeViewer.dispose) {
        element.threeViewer.dispose();
      }
      if (element.arViewer && element.arViewer.dispose) {
        element.arViewer.dispose();
      }
    });
  }
  
  cleanupUnusedResources() {
    // Find viewers that are not visible
    const invisibleViewers = Array.from(document.querySelectorAll('.three-product-viewer, .ar-product-viewer'))
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom < 0 || rect.top > window.innerHeight;
      });
    
    // Dispose invisible viewers
    invisibleViewers.forEach(element => {
      if (element.threeViewer && element.threeViewer.dispose) {
        element.threeViewer.dispose();
        element.threeViewer = null;
      }
      if (element.arViewer && element.arViewer.dispose) {
        element.arViewer.dispose();
        element.arViewer = null;
      }
      element.dataset.loaded = 'false';
      element.classList.remove('loaded');
    });
  }
  
  applyDeviceOptimizations() {
    // Add device-specific CSS classes
    document.documentElement.classList.add(
      this.isLowEndDevice ? 'low-end-device' : 'high-end-device',
      this.isMobile ? 'mobile-device' : 'desktop-device',
      `connection-${this.connectionSpeed}`
    );
    
    // Adjust CSS custom properties based on device
    const root = document.documentElement;
    
    if (this.isLowEndDevice) {
      root.style.setProperty('--animation-duration', '0.2s');
      root.style.setProperty('--blur-amount', '5px');
      root.style.setProperty('--shadow-intensity', '0.3');
    }
    
    if (this.isMobile) {
      root.style.setProperty('--hover-scale', '1.02');
      root.style.setProperty('--magnetic-strength', '0.2');
    }
  }
  
  getPerformanceReport() {
    return {
      device: {
        isLowEndDevice: this.isLowEndDevice,
        isMobile: this.isMobile,
        connectionSpeed: this.connectionSpeed
      },
      metrics: this.performanceMetrics,
      loadedResources: Array.from(this.loadedResources)
    };
  }
}

// Initialize performance optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}