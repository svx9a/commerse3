// React Glossy Polarize Components
// Advanced interactive components with glass morphism and polarized lighting

class GlossyPolarizeCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
      mousePosition: { x: 0, y: 0 }
    };
    this.cardRef = React.createRef();
  }

  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  handleMouseLeave = () => {
    this.setState({ isHovered: false, mousePosition: { x: 0, y: 0 } });
  };

  handleMouseMove = (e) => {
    if (this.cardRef.current) {
      const rect = this.cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      this.setState({ mousePosition: { x, y } });
    }
  };

  render() {
    const { children, className = '', style = {}, ...props } = this.props;
    const { isHovered, mousePosition } = this.state;

    const cardStyle = {
      ...style,
      transform: isHovered 
        ? `translateY(-8px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg) scale(1.02)`
        : 'translateY(0) rotateX(0) rotateY(0) scale(1)',
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    };

    return React.createElement('div', {
      ref: this.cardRef,
      className: `polarize-card ${className}`,
      style: cardStyle,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onMouseMove: this.handleMouseMove,
      ...props
    }, React.createElement('div', {
      className: 'polarize-card-content'
    }, children));
  }
}

class GlossyPolarizeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPressed: false,
      ripples: []
    };
  }

  handleMouseDown = (e) => {
    this.setState({ isPressed: true });
    this.createRipple(e);
  };

  handleMouseUp = () => {
    this.setState({ isPressed: false });
  };

  createRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    this.setState(prevState => ({
      ripples: [...prevState.ripples, newRipple]
    }));

    setTimeout(() => {
      this.setState(prevState => ({
        ripples: prevState.ripples.filter(ripple => ripple.id !== newRipple.id)
      }));
    }, 600);
  };

  render() {
    const { 
      children, 
      className = '', 
      onClick, 
      disabled = false,
      variant = 'primary',
      ...props 
    } = this.props;
    const { isPressed, ripples } = this.state;

    const buttonStyle = {
      transform: isPressed ? 'translateY(-3px) scale(0.98)' : 'translateY(0) scale(1)',
      position: 'relative',
      overflow: 'hidden'
    };

    return React.createElement('button', {
      className: `btn-glossy-polarize btn-glossy-${variant} ${className}`,
      style: buttonStyle,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onMouseLeave: this.handleMouseUp,
      onClick: disabled ? undefined : onClick,
      disabled,
      ...props
    }, [
      React.createElement('span', {
        key: 'text',
        className: 'btn-text'
      }, children),
      ripples.map(ripple => 
        React.createElement('span', {
          key: ripple.id,
          className: 'ripple-effect',
          style: {
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            transform: 'scale(0)',
            animation: 'ripple-animation 0.6s ease-out',
            pointerEvents: 'none'
          }
        })
      )
    ]);
  }
}

class GlossyPolarizeInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      hasValue: false
    };
    this.inputRef = React.createRef();
  }

  handleFocus = () => {
    this.setState({ isFocused: true });
  };

  handleBlur = (e) => {
    this.setState({ 
      isFocused: false,
      hasValue: e.target.value.length > 0
    });
  };

  handleChange = (e) => {
    this.setState({ hasValue: e.target.value.length > 0 });
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  };

  render() {
    const { 
      label, 
      type = 'text', 
      className = '', 
      multiline = false,
      ...props 
    } = this.props;
    const { isFocused, hasValue } = this.state;

    const InputComponent = multiline ? 'textarea' : 'input';
    const inputProps = multiline ? {} : { type };

    return React.createElement('div', {
      className: `input-glossy-polarize ${className}`
    }, [
      React.createElement(InputComponent, {
        key: 'input',
        ref: this.inputRef,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        onChange: this.handleChange,
        placeholder: ' ',
        ...inputProps,
        ...props
      }),
      label && React.createElement('label', {
        key: 'label',
        className: isFocused || hasValue ? 'active' : '',
        onClick: () => this.inputRef.current?.focus()
      }, label)
    ]);
  }
}

class GlossyPolarizeModal extends React.Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen) {
      document.body.style.overflow = this.props.isOpen ? 'hidden' : '';
    }
  }

  componentWillUnmount() {
    document.body.style.overflow = '';
  }

  handleBackdropClick = (e) => {
    if (e.target === this.modalRef.current && this.props.onClose) {
      this.props.onClose();
    }
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape' && this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    const { isOpen, children, onClose, className = '' } = this.props;

    if (!isOpen) return null;

    return React.createElement('div', {
      ref: this.modalRef,
      className: `modal-glossy-polarize ${isOpen ? 'active' : ''} ${className}`,
      onClick: this.handleBackdropClick,
      onKeyDown: this.handleKeyDown,
      tabIndex: -1,
      role: 'dialog',
      'aria-modal': 'true'
    }, React.createElement('div', {
      className: 'modal-content-polarize',
      onClick: (e) => e.stopPropagation()
    }, [
      onClose && React.createElement('button', {
        key: 'close',
        className: 'modal-close-btn',
        onClick: onClose,
        'aria-label': 'Close modal',
        style: {
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }
      }, '×'),
      React.createElement('div', {
        key: 'content'
      }, children)
    ]));
  }
}

class GlossyPolarizeProgress extends React.Component {
  render() {
    const { 
      value = 0, 
      max = 100, 
      className = '',
      showLabel = false,
      label = ''
    } = this.props;

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return React.createElement('div', {
      className: `progress-container ${className}`
    }, [
      showLabel && React.createElement('div', {
        key: 'label',
        className: 'progress-label',
        style: {
          marginBottom: '0.5rem',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem'
        }
      }, label || `${Math.round(percentage)}%`),
      React.createElement('div', {
        key: 'progress',
        className: 'progress-glossy-polarize',
        role: 'progressbar',
        'aria-valuenow': value,
        'aria-valuemin': 0,
        'aria-valuemax': max
      }, React.createElement('div', {
        className: 'progress-bar-polarize',
        style: { width: `${percentage}%` }
      }))
    ]);
  }
}

class GlossyPolarizeNavigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: props.defaultActive || 0
    };
  }

  handleItemClick = (index, item) => {
    this.setState({ activeItem: index });
    if (this.props.onItemClick) {
      this.props.onItemClick(item, index);
    }
  };

  render() {
    const { items = [], className = '' } = this.props;
    const { activeItem } = this.state;

    return React.createElement('nav', {
      className: `nav-glossy-polarize ${className}`,
      role: 'navigation'
    }, React.createElement('ul', {}, 
      items.map((item, index) => 
        React.createElement('li', {
          key: index
        }, React.createElement('a', {
          href: item.href || '#',
          className: activeItem === index ? 'active' : '',
          onClick: (e) => {
            if (!item.href || item.href === '#') {
              e.preventDefault();
            }
            this.handleItemClick(index, item);
          },
          'aria-current': activeItem === index ? 'page' : undefined
        }, item.label))
      )
    ));
  }
}

// Utility function to add ripple animation CSS
const addRippleStyles = () => {
  if (document.getElementById('ripple-styles')) return;

  const style = document.createElement('style');
  style.id = 'ripple-styles';
  style.textContent = `
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialize ripple styles when script loads
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRippleStyles);
  } else {
    addRippleStyles();
  }
}

// Export components for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GlossyPolarizeCard,
    GlossyPolarizeButton,
    GlossyPolarizeInput,
    GlossyPolarizeModal,
    GlossyPolarizeProgress,
    GlossyPolarizeNavigation
  };
} else if (typeof window !== 'undefined') {
  window.GlossyPolarizeComponents = {
    GlossyPolarizeCard,
    GlossyPolarizeButton,
    GlossyPolarizeInput,
    GlossyPolarizeModal,
    GlossyPolarizeProgress,
    GlossyPolarizeNavigation
  };
}