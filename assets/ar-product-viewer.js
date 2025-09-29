/**
 * AR Product Viewer for O2O Theme
 * Integrates WebXR API with Three.js for immersive product visualization
 * Maintains black and white aesthetic with luxury interactions
 */

class ARProductViewer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      modelUrl: options.modelUrl || null,
      scale: options.scale || 1,
      autoRotate: options.autoRotate || false,
      enableShadows: options.enableShadows !== false,
      backgroundColor: options.backgroundColor || '#000000',
      lightIntensity: options.lightIntensity || 1.2,
      enableAR: options.enableAR !== false,
      fallbackMode: options.fallbackMode || 'viewer', // 'viewer' or 'image'
      ...options
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.arButton = null;
    this.isARSupported = false;
    this.isARActive = false;
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;
    this.reticle = null;
    
    this.init();
  }
  
  async init() {
    try {
      // Check AR support
      this.isARSupported = await this.checkARSupport();
      
      // Initialize Three.js scene
      this.initScene();
      this.initCamera();
      this.initRenderer();
      this.initLights();
      this.initReticle();
      
      // Load model if provided
      if (this.options.modelUrl) {
        await this.loadModel(this.options.modelUrl);
      }
      
      // Create AR button
      this.createARButton();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start render loop
      this.animate();
      
      console.log('AR Product Viewer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AR Product Viewer:', error);
      this.showError('Failed to initialize AR viewer');
    }
  }
  
  async checkARSupport() {
    if ('xr' in navigator) {
      try {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        return isSupported;
      } catch (error) {
        console.warn('AR not supported:', error);
        return false;
      }
    }
    return false;
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
  }
  
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.container.clientWidth / this.container.clientHeight,
      0.01,
      20
    );
    this.camera.position.set(0, 1.6, 3);
  }
  
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = this.options.enableShadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // Enable XR
    this.renderer.xr.enabled = true;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  initLights() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light for shadows and definition
    const directionalLight = new THREE.DirectionalLight(0xffffff, this.options.lightIntensity);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = this.options.enableShadows;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    
    // Point lights for luxury effect
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 10);
    pointLight1.position.set(-5, 5, 5);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.6, 8);
    pointLight2.position.set(5, -3, -5);
    this.scene.add(pointLight2);
  }
  
  initReticle() {
    // Create reticle for AR placement
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    
    this.reticle = new THREE.Mesh(geometry, material);
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
  }
  
  async loadModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      
      // Add Draco decoder for compressed models
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);
      
      // Show loading indicator
      this.showLoading();
      
      loader.load(
        url,
        (gltf) => {
          this.model = gltf.scene;
          
          // Scale and position model
          this.model.scale.setScalar(this.options.scale);
          this.model.position.set(0, 0, 0);
          
          // Enable shadows
          if (this.options.enableShadows) {
            this.model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
          }
          
          // Add to scene
          this.scene.add(this.model);
          
          // Hide loading indicator
          this.hideLoading();
          
          console.log('Model loaded successfully');
          resolve(this.model);
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          this.updateLoadingProgress(percent);
        },
        (error) => {
          console.error('Error loading model:', error);
          this.hideLoading();
          this.showError('Failed to load 3D model');
          reject(error);
        }
      );
    });
  }
  
  createARButton() {
    this.arButton = document.createElement('button');
    this.arButton.className = 'ar-button btn magnetic-element';
    this.arButton.innerHTML = `
      <span class="ar-icon">📱</span>
      <span class="ar-text">${this.isARSupported ? 'View in AR' : 'AR Not Available'}</span>
    `;
    
    this.arButton.disabled = !this.isARSupported || !this.model;
    
    if (this.isARSupported && this.model) {
      this.arButton.addEventListener('click', () => this.startAR());
    }
    
    // Add to container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ar-controls';
    buttonContainer.appendChild(this.arButton);
    this.container.appendChild(buttonContainer);
  }
  
  async startAR() {
    if (!this.isARSupported || this.isARActive) return;
    
    try {
      // Request AR session
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });
      
      // Set XR session
      await this.renderer.xr.setSession(session);
      
      this.isARActive = true;
      this.arButton.textContent = 'Exit AR';
      
      // Setup AR-specific features
      this.setupARFeatures(session);
      
      // Handle session end
      session.addEventListener('end', () => {
        this.isARActive = false;
        this.arButton.textContent = 'View in AR';
        this.hitTestSource = null;
        this.hitTestSourceRequested = false;
        this.reticle.visible = false;
      });
      
    } catch (error) {
      console.error('Failed to start AR session:', error);
      this.showError('Failed to start AR session');
    }
  }
  
  async setupARFeatures(session) {
    // Setup hit testing
    const referenceSpace = await session.requestReferenceSpace('viewer');
    this.hitTestSourceRequested = true;
    
    session.requestHitTestSource({ space: referenceSpace }).then((source) => {
      this.hitTestSource = source;
    });
    
    // Handle controller input
    session.addEventListener('select', (event) => {
      if (this.reticle.visible && this.model) {
        // Place model at reticle position
        this.model.position.setFromMatrixPosition(this.reticle.matrix);
        this.model.visible = true;
      }
    });
  }
  
  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Handle visibility change for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
  
  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  animate() {
    this.renderer.setAnimationLoop((timestamp, frame) => {
      // Handle AR frame
      if (frame && this.isARActive) {
        this.handleARFrame(frame);
      }
      
      // Auto-rotate model in non-AR mode
      if (this.model && this.options.autoRotate && !this.isARActive) {
        this.model.rotation.y += 0.005;
      }
      
      // Render scene
      this.renderer.render(this.scene, this.camera);
    });
  }
  
  handleARFrame(frame) {
    if (!this.hitTestSource) return;
    
    const referenceSpace = this.renderer.xr.getReferenceSpace();
    const hitTestResults = frame.getHitTestResults(this.hitTestSource);
    
    if (hitTestResults.length > 0) {
      const hit = hitTestResults[0];
      this.reticle.visible = true;
      this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
    } else {
      this.reticle.visible = false;
    }
  }
  
  showLoading() {
    let loadingEl = this.container.querySelector('.ar-loading');
    if (!loadingEl) {
      loadingEl = document.createElement('div');
      loadingEl.className = 'ar-loading';
      loadingEl.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading 3D Model...</div>
        <div class="loading-progress">
          <div class="progress-bar"></div>
        </div>
      `;
      this.container.appendChild(loadingEl);
    }
    loadingEl.style.display = 'flex';
  }
  
  hideLoading() {
    const loadingEl = this.container.querySelector('.ar-loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }
  
  updateLoadingProgress(percent) {
    const progressBar = this.container.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  }
  
  showError(message) {
    let errorEl = this.container.querySelector('.ar-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'ar-error';
      this.container.appendChild(errorEl);
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }
  
  pause() {
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
    }
  }
  
  resume() {
    this.animate();
  }
  
  dispose() {
    // Clean up resources
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.model) {
      this.scene.remove(this.model);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
  }
}

// Initialize AR Product Viewer when DOM is loaded
function init() {
  // Wait for THREE to be available
  if (typeof THREE === 'undefined') {
    console.warn('THREE.js not loaded yet for AR viewer, retrying...');
    setTimeout(init, 100);
    return;
  }
  
  try {
    const arContainers = document.querySelectorAll('.ar-product-viewer');
    
    arContainers.forEach(container => {
      // Skip if already initialized
      if (container.arViewer) return;
      
      const options = {
        modelUrl: container.dataset.modelUrl,
        scale: parseFloat(container.dataset.scale) || 1,
        autoRotate: container.dataset.autoRotate === 'true',
        enableShadows: container.dataset.enableShadows === 'true',
        lightIntensity: parseFloat(container.dataset.lightIntensity) || 1,
        backgroundColor: container.dataset.backgroundColor || '#000000',
        cameraPosition: container.dataset.cameraPosition ? 
          container.dataset.cameraPosition.split(',').map(Number) : [0, 0, 5]
      };
      
      container.arViewer = new ARProductViewer(container, options);
    });
  } catch (error) {
    console.error('Failed to initialize AR Product Viewer:', error);
  }
}

// Initialize AR viewers when DOM is ready
document.addEventListener('DOMContentLoaded', init);}]}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ARProductViewer;
}