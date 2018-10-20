/*
 * Global variables.
 */

const transitionTimeMultiplier = 1; // scaling factor for development / debugging

export default {
  color: {
    primary: {
      default: 'hsl(248, 67%, 64%)',
      darker: 'darken(saturate($primary, 3%), 8%)',
      darkest: 'darken(saturate($primary, 5%), 42%)',
      lighter: 'lighten(desaturate($primary, 8%), 8%)',
      lightest: 'lighten(desaturate($primary, 13%), 34%)',
    },
    secondary: {
      default: 'hsl(100, 67%, 64%)',
      darker: 'darken(saturate($secondary, 3%), 13%)',
      darkest: 'darken(saturate($secondary, 5%), 34%)',
      lighter: 'lighten(desaturate($secondary, 8%), 13%)',
      lightest: 'lighten(desaturate($secondary, 13%), 34%)',
    },
    clickable: {
      // colors for clickable items (links, buttons, etc.)
      default: 'hsl(207, 67%, 64%)',
      highlight: 'hsl(207, 80%, 69%)', // 'lighten(saturate($clickable, 13%), 5%)',
      background: 'transparentize($clickable--highlight, 0.72)',
    },
    text: {
      default: 'hsl(201, 13%, 21%)',
      lighter: 'hsl(204, 8%, 76%)', // 'lighten(desaturate($text, 5%), 55%)',
      lightest: 'lighten(desaturate($text, 5%), 68%)',
      inverse: 'hsl(0, 0%, 100%)',
    },
    background: {
      default: 'hsl(201, 2%, 92%)',
      darker: 'darken(saturate($background, 3%), 16%)',
      darkest: 'darken(saturate($background, 3%), 55%)',
      slightlyOffBlack: 'hsl(201, 2%, 8%)',
      lighter: 'hsl(201, 2%, 94%)',
      slightlyOffWhite: 'hsl(201, 1%, 97%)',
      white: 'hsl(0, 0%, 100%)',
      highlight: 'hsl(201, 100%, 94%)',
      warning: 'hsl(4, 90%, 94%)',
    },
    border: {
      default: 'hsl(201, 13%, 79%)',
      darker: 'darken($border, 8%)',
      lighter: 'lighten($border, 8%)',
      lightest: 'lighten($border, 13%)',
    },
    state: {
      danger: 'hsl(0, 88%, 66%)',
      error: 'hsl(1, 62%, 58%)',
      success: 'hsl(121, 201%, 55%)',
      attention: 'hsl(34, 82%, 64%)',
    },
    transparent: 'transparent',
  },
  border: {
    radius: {
      default: '3px',
      tiny: '2px',
      small: '1px',
      large: '6px', // 2x
      huge: '$border-radius * 3',
      circle: '50%',
      pill: '999px',
    },
    width: {
      default: '1px',
      strong: '2px',
    },
  },
  font: {
    size: {
      default: '1rem', // = 14px $inuit-base-font-size
      tiny: '0.714rem',
      small: '0.857rem',
      large: '1.5rem',
      huge: '3rem',
      pageTitle: '4rem',
    },
    weight: {
      normal: '400',
      bold: '700',
    },
  },
  globalSpacingUnit: {
    default: '14px',
    tiny: '3.5px',
    small: '7px',
    large: '28px',
    huge: '56px',
  },
  transition: {
    time: {
      veryFast: `${75 * transitionTimeMultiplier}ms`,
      fast: `${150 * transitionTimeMultiplier}ms`,
      medium: `${250 * transitionTimeMultiplier}ms`,
      slow: `${400 * transitionTimeMultiplier}ms`,
      verySlow: `${1000 * transitionTimeMultiplier}ms`,
    },
  },
  zIndex: {
    recessed: -1,
    base: 0,

    // elements on the base layer that need to stick out
    elevated1: 10,
    elevated2: 11,
    elevated3: 12,

    // elements that float over the base layer
    overlayed1: 100,
    overlayed2: 110,
    overlayed3: 120,

    // elements that must never be covered
    topmost1: 1000000,
    topmost2: 1000010,
    topmost3: 1000020,
  },
};
