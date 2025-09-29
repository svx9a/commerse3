// AI Chat Interface JavaScript - O2O Theme
// Advanced chat functionality with luxury interactions

class AIChat {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.messageCount = 0;
    this.maxCharacters = 2000;
    this.settings = {
      theme: 'dark',
      fontSize: 'medium',
      soundEnabled: true,
      autoScroll: true
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.showWelcomeMessage();
    this.updateCharacterCount();
  }

  bindEvents() {
    // Input handling
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const attachmentBtn = document.getElementById('attachmentBtn');
    
    if (messageInput) {
      messageInput.addEventListener('input', () => this.handleInput());
      messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
      messageInput.addEventListener('paste', (e) => this.handlePaste(e));
    }
    
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
    
    if (attachmentBtn) {
      attachmentBtn.addEventListener('click', () => this.handleAttachment());
    }

    // Quick actions
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleQuickAction(btn.dataset.action));
    });

    // Header actions
    const settingsBtn = document.getElementById('settingsBtn');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.minimizeChat());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }

    // Modal handling
    const modalOverlay = document.getElementById('settingsModal');
    const modalCloseBtn = document.querySelector('.close-btn');
    
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeSettings();
        }
      });
    }
    
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closeSettings());
    }

    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('change', () => this.saveSettings());
    }

    // Escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSettings();
      }
    });
  }

  handleInput() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (!messageInput || !sendBtn) return;
    
    const message = messageInput.value.trim();
    const charCount = messageInput.value.length;
    
    // Update character count
    this.updateCharacterCount(charCount);
    
    // Enable/disable send button
    sendBtn.disabled = !message || charCount > this.maxCharacters;
    
    // Auto-resize textarea
    this.autoResizeTextarea(messageInput);
    
    // Show typing indicator to other users (simulated)
    if (message && !this.isTyping) {
      this.showTypingIndicator();
    } else if (!message && this.isTyping) {
      this.hideTypingIndicator();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  handlePaste(e) {
    // Handle file paste
    const items = e.clipboardData?.items;
    if (items) {
      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          this.handleFileUpload(file);
          break;
        }
      }
    }
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  updateCharacterCount(count = 0) {
    const charCountElement = document.getElementById('characterCount');
    if (charCountElement) {
      const remaining = this.maxCharacters - count;
      charCountElement.textContent = `${count}/${this.maxCharacters}`;
      
      if (remaining < 100) {
        charCountElement.style.color = 'var(--chat-warning)';
      } else if (remaining < 0) {
        charCountElement.style.color = 'var(--chat-error)';
      } else {
        charCountElement.style.color = 'var(--chat-text-muted)';
      }
    }
  }

  async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;
    
    const message = messageInput.value.trim();
    if (!message || message.length > this.maxCharacters) return;
    
    // Add user message
    this.addMessage({
      type: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    this.updateCharacterCount(0);
    document.getElementById('sendBtn').disabled = true;
    
    // Show AI typing
    this.showAITyping();
    
    // Simulate AI response
    setTimeout(() => {
      this.generateAIResponse(message);
    }, 1000 + Math.random() * 2000);
  }

  addMessage(messageData) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    this.messageCount++;
    const messageId = `message-${this.messageCount}`;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageData.type}-message`;
    messageElement.id = messageId;
    
    const avatarHtml = messageData.type === 'user' 
      ? '<div class="avatar-icon">👤</div>'
      : '<div class="avatar-icon">🤖</div>';
    
    const timeString = messageData.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    messageElement.innerHTML = `
      <div class="message-avatar">
        ${avatarHtml}
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${this.formatMessageContent(messageData.content)}
        </div>
        <div class="message-time">${timeString}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    this.messages.push({ ...messageData, id: messageId });
    
    if (this.settings.autoScroll) {
      this.scrollToBottom();
    }
    
    if (this.settings.soundEnabled) {
      this.playNotificationSound(messageData.type);
    }
  }

  formatMessageContent(content) {
    // Basic markdown-like formatting
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Convert line breaks
    content = content.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    const paragraphs = content.split('<br><br>');
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  showAITyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.classList.add('active');
    }
    this.isTyping = true;
  }

  hideAITyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.classList.remove('active');
    }
    this.isTyping = false;
  }

  generateAIResponse(userMessage) {
    this.hideAITyping();
    
    // Simulate intelligent responses based on user input
    let response = this.getContextualResponse(userMessage);
    
    this.addMessage({
      type: 'ai',
      content: response,
      timestamp: new Date()
    });
  }

  getContextualResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Predefined responses for common queries
    const responses = {
      greeting: [
        "Hello! I'm here to help you with anything you need. What can I assist you with today?",
        "Hi there! How can I make your day better?",
        "Greetings! I'm ready to help. What's on your mind?"
      ],
      help: [
        "I can help you with a wide range of tasks including:\n\n• **Product recommendations** - Find the perfect items for your needs\n• **Technical support** - Troubleshoot issues and provide solutions\n• **Information lookup** - Research topics and provide detailed answers\n• **Creative assistance** - Help with writing, brainstorming, and design\n• **Task planning** - Organize and prioritize your activities\n\nWhat specific area would you like help with?",
        "I'm here to assist with various tasks. You can ask me about products, get technical help, request information, or even brainstorm ideas. What interests you most?"
      ],
      product: [
        "I'd be happy to help you find the right product! Could you tell me more about what you're looking for? Consider sharing:\n\n• **Category** - What type of product?\n• **Budget** - Any price range in mind?\n• **Features** - What's most important to you?\n• **Use case** - How will you use it?",
        "Great! I love helping with product selection. What kind of product are you interested in, and what are your main requirements?"
      ],
      technical: [
        "I can definitely help with technical issues! To provide the best assistance, could you share:\n\n• **What device/software** you're using\n• **The specific problem** you're experiencing\n• **When it started** happening\n• **Any error messages** you've seen\n\nThe more details you provide, the better I can help!",
        "Technical support is one of my specialties! What technical challenge are you facing?"
      ],
      default: [
        "That's an interesting question! Let me think about the best way to help you with that.",
        "I understand what you're asking about. Could you provide a bit more context so I can give you the most helpful response?",
        "Thanks for sharing that with me. I'm processing your request and will provide a comprehensive response.",
        "I appreciate you bringing this up. Let me offer some insights that might be helpful."
      ]
    };
    
    // Determine response category
    let category = 'default';
    
    if (/^(hi|hello|hey|greetings)/i.test(lowerMessage)) {
      category = 'greeting';
    } else if (/help|assist|support|guide/i.test(lowerMessage)) {
      category = 'help';
    } else if (/product|item|buy|purchase|recommend/i.test(lowerMessage)) {
      category = 'product';
    } else if (/technical|error|bug|issue|problem|troubleshoot/i.test(lowerMessage)) {
      category = 'technical';
    }
    
    // Return random response from category
    const categoryResponses = responses[category];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  handleQuickAction(action) {
    const actions = {
      'product-help': "I'd love to help you find the perfect product! What are you looking for today?",
      'technical-support': "I'm here to help with any technical issues. What problem can I solve for you?",
      'general-info': "I can provide information on a wide variety of topics. What would you like to know about?",
      'creative-help': "Let's get creative! I can help with writing, brainstorming, design ideas, and more. What project are you working on?"
    };
    
    const response = actions[action] || "How can I help you with that?";
    
    this.addMessage({
      type: 'ai',
      content: response,
      timestamp: new Date()
    });
  }

  handleAttachment() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,text/*,.pdf,.doc,.docx';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => this.handleFileUpload(file));
    };
    
    input.click();
  }

  handleFileUpload(file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      this.showNotification('File too large. Maximum size is 10MB.', 'error');
      return;
    }
    
    // Simulate file upload
    this.addMessage({
      type: 'user',
      content: `📎 Uploaded: **${file.name}** (${this.formatFileSize(file.size)})`,
      timestamp: new Date()
    });
    
    // Simulate AI response to file
    setTimeout(() => {
      let response = "I've received your file. ";
      
      if (file.type.startsWith('image/')) {
        response += "I can see the image you've shared. What would you like me to help you with regarding this image?";
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        response += "I've processed the text document. How can I assist you with this content?";
      } else {
        response += "I've received the document. What specific help do you need with this file?";
      }
      
      this.addMessage({
        type: 'ai',
        content: response,
        timestamp: new Date()
      });
    }, 1500);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showWelcomeMessage() {
    const welcomeMessage = {
      type: 'ai',
      content: `Welcome to **O2O AI Assistant**! 🚀

I'm here to provide you with intelligent, personalized assistance. Here's what I can help you with:

• **Product Discovery** - Find exactly what you're looking for
• **Technical Support** - Solve problems quickly and efficiently  
• **Creative Projects** - Brainstorm and develop ideas
• **Information Research** - Get accurate, up-to-date answers
• **Task Management** - Organize and prioritize your work

Feel free to ask me anything or use the quick action buttons below to get started!`,
      timestamp: new Date()
    };
    
    setTimeout(() => {
      this.addMessage(welcomeMessage);
    }, 500);
  }

  scrollToBottom() {
    const messagesArea = document.getElementById('chatMessages');
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  }

  showTypingIndicator() {
    // This would typically show typing to other users
    // For demo purposes, we'll just log it
    console.log('User is typing...');
  }

  hideTypingIndicator() {
    console.log('User stopped typing');
  }

  playNotificationSound(messageType) {
    if (!this.settings.soundEnabled) return;
    
    // Create audio context for notification sounds
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different tones for different message types
      oscillator.frequency.setValueAtTime(
        messageType === 'user' ? 800 : 600, 
        audioContext.currentTime
      );
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification not available');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-out'
    });
    
    // Set background color based on type
    const colors = {
      info: 'var(--chat-accent)',
      success: 'var(--chat-success)',
      warning: 'var(--chat-warning)',
      error: 'var(--chat-error)'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  openSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  saveSettings() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    
    const formData = new FormData(form);
    
    this.settings = {
      theme: formData.get('theme') || 'dark',
      fontSize: formData.get('fontSize') || 'medium',
      soundEnabled: formData.has('soundEnabled'),
      autoScroll: formData.has('autoScroll')
    };
    
    this.applySettings();
    localStorage.setItem('aiChatSettings', JSON.stringify(this.settings));
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('aiChatSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
        this.applySettings();
        this.updateSettingsForm();
      }
    } catch (error) {
      console.log('Could not load settings');
    }
  }

  applySettings() {
    const root = document.documentElement;
    
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizes[this.settings.fontSize] || fontSizes.medium;
    
    // Theme is already handled by CSS variables
    // Additional theme logic could go here
  }

  updateSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (!form) return;
    
    const themeSelect = form.querySelector('[name="theme"]');
    const fontSizeSelect = form.querySelector('[name="fontSize"]');
    const soundCheckbox = form.querySelector('[name="soundEnabled"]');
    const autoScrollCheckbox = form.querySelector('[name="autoScroll"]');
    
    if (themeSelect) themeSelect.value = this.settings.theme;
    if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;
    if (soundCheckbox) soundCheckbox.checked = this.settings.soundEnabled;
    if (autoScrollCheckbox) autoScrollCheckbox.checked = this.settings.autoScroll;
  }

  minimizeChat() {
    // This would minimize the chat window
    this.showNotification('Chat minimized', 'info');
  }

  closeChat() {
    // This would close the chat interface
    if (confirm('Are you sure you want to close the chat?')) {
      window.close();
    }
  }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aiChat = new AIChat();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIChat;
}