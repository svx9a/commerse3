document.addEventListener('DOMContentLoaded', () => {
    // Convert the primary color hex to RGB for use in transparent colors
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    if (primaryColor) {
        const rgb = hexToRgb(primaryColor);
        if (rgb) {
            document.documentElement.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }

    // Initialize the 3D Globe
    initGlobe();

    // Workflow Toggle
    document.querySelectorAll('.ae-step__toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const step = btn.closest('.ae-step');
            step.classList.toggle('is-active');
            btn.textContent = step.classList.contains('is-active') ? 'Hide Details →' : 'Learn More →';
        });
    });

    // Klaviyo Form Submission
    const klaviyoForm = document.getElementById('klaviyo-form');
    const footerForm = document.getElementById('klaviyo-footer-form');
    const submitKlaviyo = async (form) => {
        const email = form.querySelector('input[type="email"]').value;
        const publicKey = 'YOUR_KLAVIYO_PUBLIC_KEY';
        const listId = 'YOUR_KLAVIYO_LIST_ID';
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
                    document.getElementById('xeta-discount').style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Klaviyo Subscribe Error:', error);
        }
    };
    klaviyoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitKlaviyo(klaviyoForm);
    });
    footerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitKlaviyo(footerForm);
    });

    // Web3 Payment Button
    document.getElementById('xeta-pay').addEventListener('click', async (e) => {
        e.preventDefault();
        if (window.XETA_ADAPTOR) {
            try {
                const result = await XETA_ADAPTOR.processPayment({ currency: 'THB', amount: 100 });
                alert(`Payment ${result.status}! Discount code: ALLVERSE10`);
                document.getElementById('xeta-discount').style.display = 'block';
            } catch (error) {
                console.error('XETA Payment Error:', error);
            }
        } else {
            alert('Web3 payments coming soon!');
        }
    });

    // SEO API (SerpApi)
    async function fetchSEOMetrics() {
        const apiKey = 'YOUR_SERPAPI_KEY';
        try {
            const response = await fetch(`https://serpapi.com/search.json?engine=google&q=shopify+marketing+tools&api_key=${apiKey}`);
            const data = await response.json();
            document.getElementById('seo-checks').textContent = `${(data.search_information.total_results / 1000000).toFixed(1)}M Searches`;
            document.getElementById('seo-badge').textContent = `Top: ${data.organic_results?.[0]?.title || 'Shopify Marketing'}`;
            if (data.organic_results?.[0]?.position <= 3 && window.sovereignAtmosphere) {
                window.sovereignAtmosphere.material.uniforms.glowColor.value.set(0x42A5F5);
            }
        } catch (error) {
            console.error('SEO API Error:', error);
            document.getElementById('seo-checks').textContent = '10M+';
        }
    }

    // Klaviyo Metrics
    async function fetchKlaviyoMetrics() {
        const publicKey = 'YOUR_KLAVIYO_PUBLIC_KEY';
        try {
            const response = await fetch(`https://a.klaviyo.com/api/v2/metrics?api_key=${publicKey}`);
            const data = await response.json();
            document.getElementById('klaviyo-uptime').textContent = '99.9%';
            document.getElementById('klaviyo-conversion').textContent = data.conversion || '40%';
        } catch (error) {
            console.error('Klaviyo API Error:', error);
        }
    }

    // Bot Army
    if (window.Sidekick) {
        Sidekick.init({ theme: 'allverse', shop: '{{ shop.domain }}' });
    }
    if (window.Relish) {
        Relish.init({ shop: '{{ shop.domain }}', klaviyoKey: 'YOUR_KLAVIYO_PUBLIC_KEY' });
    }
    if (window.EcomBot) {
        EcomBot.deploy({ section: 'workflow-steps' });
    }

    // Workflow Animation
    const steps = document.querySelectorAll('.ae-step');
    let currentStep = 0;
    async function animateSteps() {
        await Promise.all([fetchKlaviyoMetrics(), fetchSEOMetrics()]);
        steps.forEach((step, index) => {
            step.style.opacity = index === currentStep ? '1' : '0';
            step.style.transform = index === currentStep ? 'translateY(0)' : 'translateY(20px)';
        });
        currentStep = (currentStep + 1) % steps.length;
        setTimeout(animateSteps, 5000);
    }
    setTimeout(animateSteps, 1000);
});

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function initGlobe() {
    const sectionWrapper = document.querySelector('.o2odesign-v2');
    if (!sectionWrapper) return;

    const sectionId = sectionWrapper.dataset.sectionId;
    const canvasContainer = document.getElementById(`aeCanvas`);
    if (!canvasContainer || typeof THREE === 'undefined') return;

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
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
            power: { value: 2.5 },
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
        transparent: true,
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
        document.getElementById('klaviyo-form').classList.add('show');
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        sovereignEarth.rotation.y += deltaX * rotationSpeed;
        previousMousePosition.x = e.clientX;
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
    window.addEventListener('resize', function() {
        width = canvasContainer.clientWidth;
        height = canvasContainer.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}