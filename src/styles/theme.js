import * as colors from '../constants/colors';

/**
 * Design System Theme
 * Complete design tokens for consistent styling across the application
 *
 * Features:
 * - WCAG AA compliant color palette
 * - Mobile-first responsive breakpoints
 * - Consistent spacing and typography scales
 * - Accessible design patterns
 */

const theme = {
  // ========================================
  // COLOR PALETTE
  // ========================================
  colors: {
    ...colors,

    // Quick access to common colors
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[900],

    secondary: colors.secondary[500],
    secondaryHover: colors.secondary[600],
    secondaryActive: colors.secondary[700],
    secondaryLight: colors.secondary[100],
    secondaryDark: colors.secondary[900],

    accent: colors.accent[500],
    accentHover: colors.accent[600],
    accentActive: colors.accent[700],
    accentLight: colors.accent[100],
    accentDark: colors.accent[900],

    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],

    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textTertiary: colors.text.tertiary,
    textInverse: colors.text.inverse,

    bgPrimary: colors.background.primary,
    bgSecondary: colors.background.secondary,
    bgTertiary: colors.background.tertiary,

    borderPrimary: colors.border.primary,
    borderSecondary: colors.border.secondary,
  },

  // ========================================
  // TYPOGRAPHY
  // ========================================
  typography: {
    // Font families
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },

    // Font sizes (mobile-first, scales up on larger screens)
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
      '8xl': '6rem',      // 96px
      '9xl': '8rem',      // 128px
    },

    // Font weights
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    // Line heights
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
      // Specific use cases
      heading: '1.2',
      body: '1.6',
      caption: '1.4',
    },

    // Letter spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },

    // Text styles (pre-configured combinations)
    styles: {
      h1: {
        fontSize: '3rem',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '2.25rem',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '1.875rem',
        fontWeight: '600',
        lineHeight: '1.25',
        letterSpacing: '-0.025em',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: '600',
        lineHeight: '1.25',
        letterSpacing: '0',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: '600',
        lineHeight: '1.375',
        letterSpacing: '0',
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: '600',
        lineHeight: '1.375',
        letterSpacing: '0',
      },
      body: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.6',
        letterSpacing: '0',
      },
      bodyLarge: {
        fontSize: '1.125rem',
        fontWeight: '400',
        lineHeight: '1.6',
        letterSpacing: '0',
      },
      bodySmall: {
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '1.5',
        letterSpacing: '0',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0.025em',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: '500',
        lineHeight: '1.5',
        letterSpacing: '0.025em',
        textTransform: 'none',
      },
      label: {
        fontSize: '0.875rem',
        fontWeight: '500',
        lineHeight: '1.5',
        letterSpacing: '0',
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: '600',
        lineHeight: '1.5',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
    },
  },

  // ========================================
  // SPACING SCALE
  // ========================================
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    11: '2.75rem',  // 44px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    28: '7rem',     // 112px
    32: '8rem',     // 128px
    36: '9rem',     // 144px
    40: '10rem',    // 160px
    44: '11rem',    // 176px
    48: '12rem',    // 192px
    52: '13rem',    // 208px
    56: '14rem',    // 224px
    60: '15rem',    // 240px
    64: '16rem',    // 256px
    72: '18rem',    // 288px
    80: '20rem',    // 320px
    96: '24rem',    // 384px
  },

  // ========================================
  // BORDER RADIUS
  // ========================================
  borderRadius: {
    none: '0',
    xs: '0.125rem',   // 2px
    sm: '0.25rem',    // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',   // Fully rounded
    circle: '50%',    // Circle
  },

  // ========================================
  // SHADOWS
  // ========================================
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

    // Colored shadows
    primary: `0 10px 15px -3px ${colors.alpha.primary[30]}, 0 4px 6px -4px ${colors.alpha.primary[20]}`,
    secondary: `0 10px 15px -3px ${colors.alpha.secondary[30]}, 0 4px 6px -4px ${colors.alpha.secondary[20]}`,

    // Focus shadows (for accessibility)
    focusPrimary: `0 0 0 3px ${colors.alpha.primary[30]}`,
    focusSecondary: `0 0 0 3px ${colors.alpha.secondary[30]}`,
    focusError: `0 0 0 3px ${colors.error[200]}`,

    // Elevation system
    elevation1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    elevation2: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    elevation3: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    elevation4: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    elevation5: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },

  // ========================================
  // BREAKPOINTS (Mobile-First)
  // ========================================
  breakpoints: {
    // Pixel values
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },

    // Media query helpers
    up: (breakpoint) => {
      const breakpoints = {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      };
      return `@media (min-width: ${breakpoints[breakpoint]}px)`;
    },

    down: (breakpoint) => {
      const breakpoints = {
        xs: 639,
        sm: 767,
        md: 1023,
        lg: 1279,
        xl: 1535,
        '2xl': 9999,
      };
      return `@media (max-width: ${breakpoints[breakpoint]}px)`;
    },

    between: (min, max) => {
      const breakpoints = {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      };
      return `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`;
    },

    only: (breakpoint) => {
      const ranges = {
        xs: [0, 639],
        sm: [640, 767],
        md: [768, 1023],
        lg: [1024, 1279],
        xl: [1280, 1535],
        '2xl': [1536, 9999],
      };
      const [min, max] = ranges[breakpoint];
      return `@media (min-width: ${min}px) and (max-width: ${max}px)`;
    },
  },

  // ========================================
  // ANIMATIONS & TRANSITIONS
  // ========================================
  transitions: {
    // Duration
    duration: {
      fastest: '100ms',
      fast: '150ms',
      normal: '200ms',
      moderate: '300ms',
      slow: '400ms',
      slowest: '500ms',
    },

    // Timing functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Common transitions
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'border 150ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Component-specific transitions
    button: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    modal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    dropdown: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    tooltip: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Animation keyframes (for use in styled-components or CSS-in-JS)
  animations: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },

    // Slide animations
    slideInUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    slideInDown: {
      from: { transform: 'translateY(-20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    slideInLeft: {
      from: { transform: 'translateX(-20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    slideInRight: {
      from: { transform: 'translateX(20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },

    // Scale animations
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.95)', opacity: 0 },
    },

    // Spin animation
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },

    // Pulse animation
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },

    // Bounce animation
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },

    // Shake animation
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
    },
  },

  // ========================================
  // Z-INDEX SCALE
  // ========================================
  zIndex: {
    // Base layers
    base: 0,
    hide: -1,

    // Component layers (in ascending order)
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,

    // Top-level layers
    toast: 1800,
    spotlight: 1900,
    max: 2000,

    // Special cases
    behind: -1,
    auto: 'auto',
  },

  // ========================================
  // COMPONENT SIZES
  // ========================================
  sizes: {
    // Container max-widths
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    // Common component sizes
    button: {
      sm: '32px',
      base: '40px',
      lg: '48px',
      xl: '56px',
    },

    input: {
      sm: '32px',
      base: '40px',
      lg: '48px',
      xl: '56px',
    },

    icon: {
      xs: '16px',
      sm: '20px',
      base: '24px',
      lg: '32px',
      xl: '40px',
      '2xl': '48px',
    },

    avatar: {
      xs: '24px',
      sm: '32px',
      base: '40px',
      lg: '48px',
      xl: '64px',
      '2xl': '80px',
      '3xl': '96px',
    },
  },

  // ========================================
  // ACCESSIBILITY
  // ========================================
  accessibility: {
    // Focus visible styles
    focusVisible: {
      outline: `3px solid ${colors.primary[500]}`,
      outlineOffset: '2px',
    },

    // Skip link styles
    skipLink: {
      position: 'absolute',
      top: '-40px',
      left: 0,
      background: colors.primary[500],
      color: colors.neutral[0],
      padding: '8px',
      textDecoration: 'none',
      zIndex: 2000,
    },

    // Screen reader only
    srOnly: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: 0,
    },

    // Minimum touch target size (WCAG 2.1 Level AAA)
    minTouchTarget: '44px',

    // Contrast ratios (WCAG AA compliant)
    contrastRatios: {
      normalText: 4.5,
      largeText: 3,
      uiComponents: 3,
    },
  },

  // ========================================
  // UTILITIES
  // ========================================
  utilities: {
    // Max width constraints
    maxWidth: {
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      '7xl': '80rem',
      full: '100%',
      prose: '65ch',
    },

    // Aspect ratios
    aspectRatio: {
      square: '1 / 1',
      video: '16 / 9',
      portrait: '3 / 4',
      landscape: '4 / 3',
      ultrawide: '21 / 9',
    },

    // Common filters
    filters: {
      blur: {
        none: 'blur(0)',
        sm: 'blur(4px)',
        base: 'blur(8px)',
        md: 'blur(12px)',
        lg: 'blur(16px)',
        xl: 'blur(24px)',
      },
      brightness: {
        dim: 'brightness(0.8)',
        normal: 'brightness(1)',
        bright: 'brightness(1.2)',
      },
    },
  },
};

export default theme;
