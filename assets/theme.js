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
          btn.textContent = step.class