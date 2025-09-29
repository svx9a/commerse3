/**
 * O2O Auto-Save System
 * Comprehensive auto-save functionality for forms, preferences, and user interactions
 */

class AutoSaveSystem {
  constructor(options = {}) {
    this.options = {
      debounceDelay: 1000,
      storagePrefix: 'o2o_autosave_',
      showIndicator: true,
      enableFormAutoSave: true,
      enablePreferencesAutoSave: true,
      enableInteractionAutoSave: true,
      ...options
    };

    this.saveQueue = new Map();
    this.debounceTimers = new Map();
    this.indicator = null;
    this.settingsPanel = null;
    this.isEnabled = this.loadSettings().enabled !== false;

    this.init();
  }

  init() {
    if (this.options.showIndicator) {
      this.createIndicator();
    }
    
    this.createSettingsPanel();
    this.setupEventListeners();
    this.setupFormAutoSave();
    this.setupPreferencesAutoSave();
    this.setupInteractionAutoSave();
    
    console.log('O2O Auto-Save System initialized');
  }

  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'auto-save-indicator';
    this.indicator.innerHTML = `
      <svg class="auto-save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
      <span class="auto-save-text">Auto-saving...</span>
    `;
    document.body.appendChild(this.indicator);
  }

  createSettingsPanel() {
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'auto-save-settings';
    this.settingsPanel.innerHTML = `
      <h4>Auto-Save Settings</h4>
      <div class="auto-save-toggle">
        <span>Enable Auto-Save</span>
        <div class="toggle-switch ${this.isEnabled ? 'active' : ''}" data-setting="enabled">
          <div class="toggle-handle"></div>
        </div>
      </div>
      <div class="auto-save-toggle">
        <span>Form Auto-Save</span>
        <div class="toggle-switch ${this.options.enableFormAutoSave ? 'active' : ''}" data-setting="forms">
          <div class="toggle-handle"></div>
        </div>
      </div>
      <div class="auto-save-toggle">
        <span>Preferences Auto-Save</span>
        <div class="toggle-switch ${this.options.enablePreferencesAutoSave ? 'active' : ''}" data-setting="preferences">
          <div class="toggle-handle"></div>
        </div>
      </div>
      <div class="auto-save-toggle">
        <span>Interaction Auto-Save</span>
        <div class="toggle-switch ${this.options.enableInteractionAutoSave ? 'active' : ''}" data-setting="interactions">
          <div class="toggle-handle"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.settingsPanel);
  }

  setupEventListeners() {
    // Settings panel toggles
    this.settingsPanel.addEventListener('click', (e) => {
      const toggle = e.target.closest('.toggle-switch');
      if (toggle) {
        const setting = toggle.dataset.setting;
        const isActive = toggle.classList.contains('active');
        
        toggle.classList.toggle('active');
        this.updateSetting(setting, !isActive);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S to toggle settings panel
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.toggleSettingsPanel();
      }
      
      // Ctrl/Cmd + Shift + S to toggle auto-save
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.toggleAutoSave();
      }
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveAllPending();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.saveAllPending();
    });
  }

  setupFormAutoSave() {
    if (!this.options.enableFormAutoSave) return;

    // Auto-save for all form inputs
    document.addEventListener('input', (e) => {
      if (!this.isEnabled) return;
      
      const input = e.target;
      if (this.isFormElement(input)) {
        this.scheduleAutoSave(`form_${input.name || input.id}`, () => {
          return this.saveFormField(input);
        }, input);
      }
    });

    // Auto-save for form changes
    document.addEventListener('change', (e) => {
      if (!this.isEnabled) return;
      
      const input = e.target;
      if (this.isFormElement(input)) {
        this.scheduleAutoSave(`form_${input.name || input.id}`, () => {
          return this.saveFormField(input);
        }, input);
      }
    });
  }

  setupPreferencesAutoSave() {
    if (!this.options.enablePreferencesAutoSave) return;

    // Theme changes
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.scheduleAutoSave('theme_preferences', () => {
            return this.saveThemePreferences();
          });
        }
      });
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  setupInteractionAutoSave() {
    if (!this.options.enableInteractionAutoSave) return;

    // 3D viewer settings
    document.addEventListener('viewerSettingsChange', (e) => {
      if (!this.isEnabled) return;
      
      this.scheduleAutoSave('viewer_settings', () => {
        return this.saveViewerSettings(e.detail);
      });
    });

    // Chat preferences
    document.addEventListener('chatSettingsChange', (e) => {
      if (!this.isEnabled) return;
      
      this.scheduleAutoSave('chat_settings', () => {
        return this.saveChatSettings(e.detail);
      });
    });
  }

  scheduleAutoSave(key, saveFunction, element = null) {
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    // Add visual feedback
    if (element) {
      this.addSavingState(element);
    }

    // Schedule save
    const timer = setTimeout(async () => {
      try {
        this.showIndicator('saving');
        await saveFunction();
        this.showIndicator('saved');
        
        if (element) {
          this.addSavedState(element);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        this.showIndicator('error');
        
        if (element) {
          this.addErrorState(element);
        }
      }
      
      this.debounceTimers.delete(key);
    }, this.options.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  async saveFormField(input) {
    const formData = this.getFormData(input.form || input.closest('form'));
    const key = `${this.options.storagePrefix}form_${input.form?.id || 'default'}`;
    
    localStorage.setItem(key, JSON.stringify({
      data: formData,
      timestamp: Date.now(),
      url: window.location.pathname
    }));

    return { success: true, field: input.name || input.id };
  }

  async saveThemePreferences() {
    const preferences = {
      theme: document.documentElement.className,
      colorScheme: getComputedStyle(document.documentElement).getPropertyValue('color-scheme'),
      timestamp: Date.now()
    };

    const key = `${this.options.storagePrefix}theme_preferences`;
    localStorage.setItem(key, JSON.stringify(preferences));

    return { success: true, preferences };
  }

  async saveViewerSettings(settings) {
    const key = `${this.options.storagePrefix}viewer_settings`;
    localStorage.setItem(key, JSON.stringify({
      ...settings,
      timestamp: Date.now()
    }));

    return { success: true, settings };
  }

  async saveChatSettings(settings) {
    const key = `${this.options.storagePrefix}chat_settings`;
    localStorage.setItem(key, JSON.stringify({
      ...settings,
      timestamp: Date.now()
    }));

    return { success: true, settings };
  }

  loadFormData(formId) {
    const key = `${this.options.storagePrefix}form_${formId}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.url === window.location.pathname) {
          return data.data;
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    }
    
    return null;
  }

  restoreFormData(form) {
    const formId = form.id || 'default';
    const savedData = this.loadFormData(formId);
    
    if (savedData) {
      Object.entries(savedData).forEach(([name, value]) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = value;
          } else {
            input.value = value;
          }
        }
      });
      
      return true;
    }
    
    return false;
  }

  getFormData(form) {
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }

  isFormElement(element) {
    return element && (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.tagName === 'SELECT'
    );
  }

  addSavingState(element) {
    const field = element.closest('.form-field');
    if (field) {
      field.classList.remove('saved', 'error');
      field.classList.add('saving');
    }
    
    element.classList.remove('auto-saved');
    element.classList.add('auto-saving');
  }

  addSavedState(element) {
    const field = element.closest('.form-field');
    if (field) {
      field.classList.remove('saving', 'error');
      field.classList.add('saved');
      
      setTimeout(() => {
        field.classList.remove('saved');
      }, 2000);
    }
    
    element.classList.remove('auto-saving');
    element.classList.add('auto-saved');
    
    setTimeout(() => {
      element.classList.remove('auto-saved');
    }, 2000);
  }

  addErrorState(element) {
    const field = element.closest('.form-field');
    if (field) {
      field.classList.remove('saving', 'saved');
      field.classList.add('error');
      
      setTimeout(() => {
        field.classList.remove('error');
      }, 3000);
    }
    
    element.classList.remove('auto-saving', 'auto-saved');
  }

  showIndicator(state) {
    if (!this.indicator) return;

    this.indicator.className = `auto-save-indicator show ${state}`;
    
    const text = this.indicator.querySelector('.auto-save-text');
    const icon = this.indicator.querySelector('.auto-save-icon');
    
    switch (state) {
      case 'saving':
        text.textContent = 'Auto-saving...';
        icon.innerHTML = `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`;
        break;
      case 'saved':
        text.textContent = 'Saved';
        icon.innerHTML = `<polyline points="20,6 9,17 4,12"/>`;
        break;
      case 'error':
        text.textContent = 'Save failed';
        icon.innerHTML = `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`;
        break;
    }

    // Auto-hide after delay
    setTimeout(() => {
      this.indicator.classList.remove('show');
    }, state === 'error' ? 4000 : 2000);
  }

  toggleSettingsPanel() {
    this.settingsPanel.classList.toggle('show');
  }

  toggleAutoSave() {
    this.isEnabled = !this.isEnabled;
    this.updateSetting('enabled', this.isEnabled);
    
    const toggle = this.settingsPanel.querySelector('[data-setting="enabled"]');
    toggle.classList.toggle('active', this.isEnabled);
  }

  updateSetting(setting, value) {
    const settings = this.loadSettings();
    settings[setting] = value;
    
    localStorage.setItem(`${this.options.storagePrefix}settings`, JSON.stringify(settings));
    
    // Update instance properties
    switch (setting) {
      case 'enabled':
        this.isEnabled = value;
        break;
      case 'forms':
        this.options.enableFormAutoSave = value;
        break;
      case 'preferences':
        this.options.enablePreferencesAutoSave = value;
        break;
      case 'interactions':
        this.options.enableInteractionAutoSave = value;
        break;
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(`${this.options.storagePrefix}settings`);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  }

  async saveAllPending() {
    const promises = [];
    
    for (const [key, timer] of this.debounceTimers.entries()) {
      clearTimeout(timer);
      // Execute save immediately
      const saveFunction = this.saveQueue.get(key);
      if (saveFunction) {
        promises.push(saveFunction());
      }
    }
    
    this.debounceTimers.clear();
    this.saveQueue.clear();
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving pending data:', error);
    }
  }

  // Public API methods
  enableAutoSave() {
    this.isEnabled = true;
    this.updateSetting('enabled', true);
  }

  disableAutoSave() {
    this.isEnabled = false;
    this.updateSetting('enabled', false);
  }

  clearAutoSaveData(type = 'all') {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.options.storagePrefix)
    );
    
    keys.forEach(key => {
      if (type === 'all' || key.includes(type)) {
        localStorage.removeItem(key);
      }
    });
  }

  getAutoSaveStatus() {
    return {
      enabled: this.isEnabled,
      pendingSaves: this.debounceTimers.size,
      settings: this.loadSettings()
    };
  }
}

// Initialize auto-save system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.autoSaveSystem = new AutoSaveSystem({
    debounceDelay: 1500,
    showIndicator: true,
    enableFormAutoSave: true,
    enablePreferencesAutoSave: true,
    enableInteractionAutoSave: true
  });

  // Restore form data for existing forms
  document.querySelectorAll('form').forEach(form => {
    if (form.dataset.autoSave !== 'false') {
      window.autoSaveSystem.restoreFormData(form);
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoSaveSystem;
}