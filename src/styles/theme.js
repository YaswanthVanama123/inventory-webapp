import * as colors from '../constants/colors';



const theme = {
  
  
  
  colors: {
    ...colors,

    
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

  
  
  
  typography: {
    
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },

    
    fontSize: {
      xs: '0.75rem',      
      sm: '0.875rem',     
      base: '1rem',       
      lg: '1.125rem',     
      xl: '1.25rem',      
      '2xl': '1.5rem',    
      '3xl': '1.875rem',  
      '4xl': '2.25rem',   
      '5xl': '3rem',      
      '6xl': '3.75rem',   
      '7xl': '4.5rem',    
      '8xl': '6rem',      
      '9xl': '8rem',      
    },

    
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

    
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
      
      heading: '1.2',
      body: '1.6',
      caption: '1.4',
    },

    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },

    
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

  
  
  
  spacing: {
    0: '0',
    1: '0.25rem',   
    2: '0.5rem',    
    3: '0.75rem',   
    4: '1rem',      
    5: '1.25rem',   
    6: '1.5rem',    
    7: '1.75rem',   
    8: '2rem',      
    9: '2.25rem',   
    10: '2.5rem',   
    11: '2.75rem',  
    12: '3rem',     
    14: '3.5rem',   
    16: '4rem',     
    20: '5rem',     
    24: '6rem',     
    28: '7rem',     
    32: '8rem',     
    36: '9rem',     
    40: '10rem',    
    44: '11rem',    
    48: '12rem',    
    52: '13rem',    
    56: '14rem',    
    60: '15rem',    
    64: '16rem',    
    72: '18rem',    
    80: '20rem',    
    96: '24rem',    
  },

  
  
  
  borderRadius: {
    none: '0',
    xs: '0.125rem',   
    sm: '0.25rem',    
    base: '0.375rem', 
    md: '0.5rem',     
    lg: '0.75rem',    
    xl: '1rem',       
    '2xl': '1.5rem',  
    '3xl': '2rem',    
    full: '9999px',   
    circle: '50%',    
  },

  
  
  
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

    
    primary: `0 10px 15px -3px ${colors.alpha.primary[30]}, 0 4px 6px -4px ${colors.alpha.primary[20]}`,
    secondary: `0 10px 15px -3px ${colors.alpha.secondary[30]}, 0 4px 6px -4px ${colors.alpha.secondary[20]}`,

    
    focusPrimary: `0 0 0 3px ${colors.alpha.primary[30]}`,
    focusSecondary: `0 0 0 3px ${colors.alpha.secondary[30]}`,
    focusError: `0 0 0 3px ${colors.error[200]}`,

    
    elevation1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    elevation2: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    elevation3: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    elevation4: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
    elevation5: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },

  
  
  
  breakpoints: {
    
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },

    
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

  
  
  
  transitions: {
    
    duration: {
      fastest: '100ms',
      fast: '150ms',
      normal: '200ms',
      moderate: '300ms',
      slow: '400ms',
      slowest: '500ms',
    },

    
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'border 150ms cubic-bezier(0.4, 0, 0.2, 1)',

    
    button: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    modal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    dropdown: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    tooltip: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  
  animations: {
    
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },

    
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

    
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.95)', opacity: 0 },
    },

    
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },

    
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },

    
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },

    
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
    },
  },

  
  
  
  zIndex: {
    
    base: 0,
    hide: -1,

    
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,

    
    toast: 1800,
    spotlight: 1900,
    max: 2000,

    
    behind: -1,
    auto: 'auto',
  },

  
  
  
  sizes: {
    
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    
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

  
  
  
  accessibility: {
    
    focusVisible: {
      outline: `3px solid ${colors.primary[500]}`,
      outlineOffset: '2px',
    },

    
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

    
    minTouchTarget: '44px',

    
    contrastRatios: {
      normalText: 4.5,
      largeText: 3,
      uiComponents: 3,
    },
  },

  
  
  
  utilities: {
    
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

    
    aspectRatio: {
      square: '1 / 1',
      video: '16 / 9',
      portrait: '3 / 4',
      landscape: '4 / 3',
      ultrawide: '21 / 9',
    },

    
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
