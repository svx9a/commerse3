// 3D Product Viewer with Three.js Integration
// Optimized for O2O Theme with Black & White Aesthetic
// Performance-focused with mobile optimization

class ThreeProductViewer {
  constructor(container, options = {}) {
    // Wait for THREE to be available
    if (typeof THREE === 'undefined') {
      console.warn('THREE.js not loaded yet, retrying...');
      setTimeout(() => {
        this.init(container, options);
      }, 100);
      return;
    }
    
    this.init(container, options);
  }
  
  init(container, options) {
    this.container = container;
    this.options = {
      enableControls: true,
      enableLighting: true,
      enableShadows: true,
      autoRotate: false,
      backgroundColor: 0x0a0a0a,
      cameraPosition: { x: 0, y: 0, z: 5 },
      ...options
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.isLoaded = false;
    this.isDestroyed = false;
    
    this.init();
  }

  async init() {
    try {
      // Check if Three.js is loaded
      if (typeof THREE === 'undefined') {
        await this.loadThreeJS();
      }
      
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLighting();
      
      if (this.options.enableControls) {
        await this.setupControls();
      }
      
      this.setupEventListeners();
      this.animate();
      
      // Dispatch ready event
      this.container.dispatchEvent(new CustomEvent('3dViewerReady', {
        detail: { viewer: this }
      }));
      
    } catch (error) {
      console.error('Failed to initialize 3D viewer:', error);
      this.showFallback();
    }
  }

  async loadThreeJS() {
    return new Promise((resolve, reject) => {
      // Load Three.js from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        // Load additional modules
        this.loadAdditionalModules().then(resolve).catch(reject);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async loadAdditionalModules() {
    const modules = [
      'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
      'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
      'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/DRACOLoader.js'
    ];
    
    for (const src of modules) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
    
    // Add fog for depth
    this.scene.fog = new THREE.Fog(this.options.backgroundColor, 10, 50);
  }

  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    const pos = this.options.cameraPosition;
    this.camera.position.set(pos.x, pos.y, pos.z);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if (this.options.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    this.container.appendChild(this.renderer.domElement);
  }

  setupLighting() {
    if (!this.options.enableLighting) return;
    
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = this.options.enableShadows;
    
    if (this.options.enableShadows) {
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
    }
    
    this.scene.add(directionalLight);
    
    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);
    
    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);
  }

  async setupControls() {
    if (typeof THREE.OrbitControls === 'undefined') {
      console.warn('OrbitControls not available');
      return;
    }
    
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.maxDistance = 10;
    this.controls.minDistance = 2;
  }

  async loadModel(modelPath, options = {}) {
    if (!modelPath) {
      console.error('Model path is required');
      return false;
    }
    
    try {
      this.showLoadingIndicator();
      
      const loader = new THREE.GLTFLoader();
      
      // Setup DRACO decoder for compressed models
      if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');
        loader.setDRACOLoader(dracoLoader);
      }
      
      const gltf = await new Promise((resolve, reject) => {
        loader.load(modelPath, resolve, undefined, reject);
      });
      
      // Remove existing model
      if (this.model) {
        this.scene.remove(this.model);
      }
      
      this.model = gltf.scene;
      
      // Setup animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        gltf.animations.forEach(clip => {
          const action = this.mixer.clipAction(clip);
          if (options.autoPlay !== false) {
            action.play();
          }
        });
      }
      
      // Configure model
      this.configureModel(options);
      
      // Add to scene
      this.scene.add(this.model);
      
      // Center and scale model
      this.centerModel();
      
      this.isLoaded = true;
      this.hideLoadingIndicator();
      
      // Dispatch loaded event
      this.container.dispatchEvent(new CustomEvent('3dModelLoaded', {
        detail: { model: this.model, gltf }
      }));
      
      return true;
      
    } catch (error) {
      console.error('Failed to load 3D model:', error);
      this.hideLoadingIndicator();
      this.showErrorMessage('Failed to load 3D model');
      return false;
    }
  }

  configureModel(options = {}) {
    if (!this.model) return;
    
    // Enable shadows
    if (this.options.enableShadows) {
      this.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
    
    // Apply materials optimization
    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        // Optimize materials for performance
        if (child.material.map) {
          child.material.map.generateMipmaps = false;
        }
        child.material.needsUpdate = true;
      }
    });
    
    // Apply custom transformations
    if (options.scale) {
      this.model.scale.setScalar(options.scale);
    }
    
    if (options.rotation) {
      this.model.rotation.set(options.rotation.x || 0, options.rotation.y || 0, options.rotation.z || 0);
    }
    
    if (options.position) {
      this.model.position.set(options.position.x || 0, options.position.y || 0, options.position.z || 0);
    }
  }

  centerModel() {
    if (!this.model) return;
    
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the model
    this.model.position.sub(center);
    
    // Scale to fit viewport
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim;
    this.model.scale.setScalar(scale);
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Handle visibility change for performance
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Integrate with existing magnetic interactions
    this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  handleResize() {
    if (this.isDestroyed) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  handleMouseEnter() {
    if (this.controls) {
      this.controls.autoRotate = true;
    }
  }

  handleMouseLeave() {
    if (this.controls) {
      this.controls.autoRotate = this.options.autoRotate;
    }
  }

  animate() {
    if (this.isDestroyed) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.className = 'three-loader';
    loader.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading 3D Model...</p>
    `;
    this.container.appendChild(loader);
  }

  hideLoadingIndicator() {
    const loader = this.container.querySelector('.three-loader');
    if (loader) {
      loader.remove();
    }
  }

  showErrorMessage(message) {
    const error = document.createElement('div');
    error.className = 'three-error';
    error.innerHTML = `
      <p>${message}</p>
      <button onclick="location.reload()">Retry</button>
    `;
    this.container.appendChild(error);
  }

  showFallback() {
    this.container.innerHTML = `
      <div class="three-fallback">
        <p>3D viewer not supported on this device</p>
        <p>Please use a modern browser with WebGL support</p>
      </div>
    `;
  }

  pause() {
    this.clock.stop();
  }

  resume() {
    this.clock.start();
  }

  destroy() {
    this.isDestroyed = true;
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Dispose of Three.js objects
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.model) {
      this.scene.remove(this.model);
    }
    
    // Clear container
    this.container.innerHTML = '';
  }
}

// Auto-initialize 3D viewers
document.addEventListener('DOMContentLoaded', function() {
  const viewers = document.querySelectorAll('.three-product-viewer');
  
  viewers.forEach(container => {
    const options = {
      enableControls: container.dataset.controls !== 'false',
      autoRotate: container.dataset.autoRotate === 'true',
      backgroundColor: container.dataset.backgroundColor || 0x0a0a0a
    };
    
    const viewer = new ThreeProductViewer(container, options);
    
    // Load model if specified
    const modelPath = container.dataset.model;
    if (modelPath) {
      viewer.loadModel(modelPath);
    }
    
    // Store reference for external access
    container.threeViewer = viewer;
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreeProductViewer;
}