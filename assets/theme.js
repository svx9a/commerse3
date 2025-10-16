{% comment %} ALLVERSE Shopify Theme - assets/theme.js {% endcomment %}
(function () {
  'use strict';

  // Shopify PubSub for event handling
  if (!window.Shopify) {
    console.error('Shopify object not found. Core functionality may be limited.');
    window.Shopify = { publish: () => {}, subscribe: () => {} };
  }

  // Initialize ALLVERSE and Shopify features
  document.addEventListener('DOMContentLoaded', () => {
    // Convert --color-primary to RGB for ALLVERSE
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    if (primaryColor) {
      const rgb = hexToRgb(primaryColor);
      if (rgb) {
        document.documentElement.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
    }

    // Initialize Three.js Globe
    initGlobe();

    // Fallback if Three.js fails
    if (typeof THREE === 'undefined') {
      console.error('Three.js not loaded. Globe will not render.');
      const canvas = document.getElementById('aeCanvas');
      if (canvas) {
        canvas.innerHTML = '<p style="color: var(--text-medium); text-align: center;">Unable to load 3D globe. Please try again later.</p>';
      }
    }

    // Shopify Cart Drawer
    initCartDrawer();

    // Workflow Toggle
    const toggles = document.querySelectorAll('.ae-step__toggle');
    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = btn.closest('.ae-step');
        if (step) {
          step.classList.toggle('is-active');
          btn.textContent = step.classList.contains('is-active') ? 'Hide Details →' : 'Learn More →';
        }
      });
    });

    // Klaviyo Form Submission
    const klaviyoForm = document.getElementById('klaviyo-form');
    const footerForm = document.getElementById('klaviyo-footer-form');
    const submitKlaviyo = async (form) => {
      if (!form) return;
      const email = form.querySelector('input[type="email"]').value;
      const publicKey = 'YOUR_KLAVIYO_PUBLIC_KEY'; // Replace with your Klaviyo public key
      const listId = 'YOUR_KLAVIYO_LIST_ID'; // Replace with your Klaviyo list ID
      try {
        const response = await fetch(`https://manage.klaviyo.com/api/v2/list/${listId}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ profiles: [{ email }] })
        });
        if (response.ok) {
          form.reset();
          form.classList.remove('show');
          alert('Welcome to the ALLVERSE Cosmos!');
          if (window.XETA_ADAPTOR) {
            XETA_ADAPTOR.offerDiscount('ALLVERSE10', { trigger: 'klaviyo-subscribe' });
            const discount = document.getElementById('xeta-discount');
            if (discount) discount.style.display = 'block';
          }
          Shopify.publish('allverse:klaviyo:success', { email });
        } else {
          console.error('Klaviyo Subscribe Failed:', response.statusText);
          alert('Failed to subscribe. Please try again.');
        }
      } catch (error) {
        console.error('Klaviyo Subscribe Error:', error);
        alert('Failed to subscribe. Please try again.');
      }
    };
    if (klaviyoForm) {
      klaviyoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitKlaviyo(klaviyoForm);
      });
    }
    if (footerForm) {
      footerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitKlaviyo(footerForm);
      });
    }

    // Web3 Payment Button
    const xetaPay = document.getElementById('xeta-pay');
    if (xetaPay) {
      xetaPay.addEventListener('click', async (e) => {
        e.preventDefault();
        if (window.XETA_ADAPTOR) {
          try {
            const result = await XETA_ADAPTOR.processPayment({ currency: 'THB', amount: 100 });
            alert(`Payment ${result.status}! Discount code: ALLVERSE10`);
            const discount = document.getElementById('xeta-discount');
            if (discount) discount.style.display = 'block';
            Shopify.publish('allverse:payment:success', result);
          } catch (error) {
            console.error('XETA Payment Error:', error);
            alert('Web3 payment failed. Please try again.');
            Shopify.publish('allverse:payment:error', error);
          }
        } else {
          alert('Web3 payments coming soon!');
        }
      });
    }

    // SEO Metrics (SerpApi)
    async function fetchSEOMetrics() {
      const apiKey = 'YOUR_SERPAPI_KEY'; // Replace with your SerpApi key
      try {
        const response = await fetch(`https://serpapi.com/search.json?engine=google&q=shopify+marketing+tools&api_key=${apiKey}`);
        const data = await response.json();
        const seoChecks = document.getElementById('seo-checks');
        if (seoChecks) {
          seoChecks.textContent = `${(data.search_information.total_results / 1000000).toFixed(1)}M Searches`;
        }
        const seoBadge = document.getElementById('seo-badge');
        if (seoBadge) {
          seoBadge.textContent = `Top: ${data.organic_results?.[0]?.title || 'Shopify Marketing'}`;
        }
        if (data.organic_results?.[0]?.position <= 3 && window.sovereignAtmosphere) {
          window.sovereignAtmosphere.material.uniforms.glowColor.value.set(0x42A5F5);
        }
        Shopify.publish('allverse:seo:success', data);
      } catch (error) {
        console.error('SEO API Error:', error);
        const seoChecks = document.getElementById('seo-checks');
        if (seoChecks) seoChecks.textContent = '10M+';
        Shopify.publish('allverse:seo:error', error);
      }
    }

    // Klaviyo Metrics
    async function fetchKlaviyoMetrics() {
      const publicKey = 'YOUR_KLAVIYO_PUBLIC_KEY'; // Replace with your Klaviyo public key
      try {
        const response = await fetch(`https://a.klaviyo.com/api/v2/metrics?api_key=${publicKey}`);
        const data = await response.json();
        const uptime = document.getElementById('klaviyo-uptime');
        if (uptime) uptime.textContent = '99.9%';
        const conversion = document.getElementById('klaviyo-conversion');
        if (conversion) conversion.textContent = data.conversion || '40%';
        Shopify.publish('allverse:klaviyo:metrics', data);
      } catch (error) {
        console.error('Klaviyo API Error:', error);
        const uptime = document.getElementById('klaviyo-uptime');
        if (uptime) uptime.textContent = '99.9%';
        const conversion = document.getElementById('klaviyo-conversion');
        if (conversion) conversion.textContent = '40%';
        Shopify.publish('allverse:klaviyo:error', error);
      }
    }

    // Bot Army (Sapphire Scout, Emerald Enforcer, Omega Overseer, Quantum Quartermaster)
    if (window.Sidekick) {
      Sidekick.init({ theme: 'allverse', shop: '{{ shop.domain }}' });
      Shopify.publish('allverse:bot:sidekick', { status: 'initialized' });
    }
    if (window.Relish) {
      Relish.init({ shop: '{{ shop.domain }}', klaviyoKey: 'YOUR_KLAVIYO_PUBLIC_KEY' });
      Shopify.publish('allverse:bot:relish', { status: 'initialized' });
    }
    if (window.EcomBot) {
      EcomBot.deploy({ section: 'workflow-steps' });
      Shopify.publish('allverse:bot:ecombot', { status: 'initialized' });
    }

    // Workflow Animation
    const steps = document.querySelectorAll('.ae-step');
    let currentStep = 0;
    async function animateSteps() {
      try {
        await Promise.all([fetchKlaviyoMetrics(), fetchSEOMetrics()]);
        steps.forEach((step, index) => {
          step.style.opacity = index === currentStep ? '1' : '0';
          step.style.transform = index === currentStep ? 'translateY(0)' : 'translateY(20px)';
        });
        currentStep = (currentStep + 1) % steps.length;
      } catch (error) {
        console.error('Workflow Animation Error:', error);
        Shopify.publish('allverse:animation:error', error);
      }
      setTimeout(animateSteps, 5000);
    }
    setTimeout(animateSteps, 1000);

    // Shopify Predictive Search
    if (window.Shopify && document.querySelector('predictive-search')) {
      import('{{ "predictive-search.js" | asset_url }}').then((module) => {
        module.default();
        Shopify.publish('shopify:search:loaded', { status: 'success' });
      }).catch((error) => {
        console.error('Predictive Search Error:', error);
        Shopify.publish('shopify:search:error', error);
      });
    }

    // Accessibility: Skip to Content
    const skipLink = document.querySelector('.skip-to-content-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const mainContent = document.getElementById('MainContent');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });

  // Three.js Globe
  function initGlobe() {
    const sectionWrapper = document.querySelector('.o2odesign-v2');
    if (!sectionWrapper) {
      console.error('Section wrapper (.o2odesign-v2) not found.');
      return;
    }

    const canvasContainer = document.getElementById('aeCanvas');
    if (!canvasContainer) {
      console.error('Canvas container (#aeCanvas) not found.');
      return;
    }

    if (typeof THREE === 'undefined') {
      console.error('Three.js not loaded.');
      return;
    }

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    canvasContainer.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(5, 5, 5);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x6ee7b7, 1.5);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // Sovereign Earth
    const planetRadius = 1.0;
    const segments = 128;
    const geometry = new THREE.SphereGeometry(planetRadius, segments, segments);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1A67A2,
      roughness: 0.6,
      metalness: 0.2,
      vertexColors: true
    });

    // Vertex Colors
    const vertices = geometry.attributes.position.array;
    const colors = [];
    const cOcean = new THREE.Color(0x0A4E6B);
    const cGreen = new THREE.Color(0x10B981);
    const cBrown = new THREE.Color(0x967969);
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      const landNoise = Math.abs(Math.sin(x * 5) * Math.cos(y * 5) * Math.sin(z * 5));
      colors.push(landNoise > 0.4 ? (Math.random() > 0.5 ? cBrown.r : cGreen.r) : cOcean.r,
                  landNoise > 0.4 ? (Math.random() > 0.5 ? cBrown.g : cGreen.g) : cOcean.g,
                  landNoise > 0.4 ? (Math.random() > 0.5 ? cBrown.b : cGreen.b) : cOcean.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    material.vertexColors = true;

    const sovereignEarth = new THREE.Mesh(geometry, material);
    scene.add(sovereignEarth);

    // Atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.04, segments, segments);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x10b981) },
        coefficient: { value: 0.8 },
        power: { value: 2.5 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float coefficient;
        uniform float power;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(coefficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
          gl_FragColor = vec4(glowColor * intensity, intensity * 0.4);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const sovereignAtmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    sovereignEarth.add(sovereignAtmosphere);
    window.sovereignAtmosphere = sovereignAtmosphere; // For SEO glow adjustment

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025 });
    const starsVertices = [];
    for (let i = 0; i < 15000; i++) {
      starsVertices.push((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    scene.add(new THREE.Points(starsGeometry, starsMaterial));

    // Interaction Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const rotationSpeed = 0.004;
    let autoRotateY = 0.0015;

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition.x = e.clientX;
      previousMousePosition.y = e.clientY;
      if (klaviyoForm) {
        klaviyoForm.classList.add('show');
      }
      Shopify.publish('allverse:globe:interact', { action: 'mousedown' });
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      Shopify.publish('allverse:globe:interact', { action: 'mouseup' });
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      sovereignEarth.rotation.y += deltaX * rotationSpeed;
      previousMousePosition.x = e.clientX;
      Shopify.publish('allverse:globe:interact', { action: 'mousemove', deltaX });
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.0005;
      sovereignAtmosphere.material.uniforms.power.value = 2.5 + 0.5 * Math.sin(time);
      if (!isDragging) {
        sovereignEarth.rotation.y += autoRotateY;
      }
      sovereignAtmosphere.rotation.copy(sovereignEarth.rotation);
      renderer.render(scene, camera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
      width = canvasContainer.clientWidth;
      height = canvasContainer.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      Shopify.publish('allverse:globe:resize', { width, height });
    });
  }

  // Shopify Cart Drawer
  function initCartDrawer() {
    if (window.Shopify && document.querySelector('cart-drawer')) {
      import('{{ "cart-drawer.js" | asset_url }}').then((module) => {
        module.default();
        Shopify.publish('shopify:cart:loaded', { status: 'success' });
      }).catch((error) => {
        console.error('Cart Drawer Error:', error);
        Shopify.publish('shopify:cart:error', error);
      });
    }
  }

  // Utility: Convert Hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Beae/Shogun Compatibility
  function handleBeaeSnippets() {
    // Monitor Beae snippets for conflicts
    const beaeElements = document.querySelectorAll('[class*="beae-"]');
    beaeElements.forEach((el) => {
      if (el.style.zIndex > 10) {
        el.style.zIndex = '9'; // Ensure ALLVERSE content stays above Beae
      }
    });
  }

  // Run Beae compatibility check after a delay to account for dynamic injection
  setTimeout(handleBeaeSnippets, 1000);

  // Shopify Design Mode
  if (Shopify.designMode) {
    document.documentElement.classList.add('shopify-design-mode');
    Shopify.subscribe('shopify:section:load', handleBeaeSnippets);
    Shopify.subscribe('shopify:section:unload', handleBeaeSnippets);
  }
})();