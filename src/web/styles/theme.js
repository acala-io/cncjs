/*
 * Global variables.
 */

import Color from 'color';

const transitionTimeMultiplier = 1; // scaling factor for development / debugging

// Base values for deriving variations
const borderRadius = 3;
const borderWidth = 1;

export const size = 14;

const colorPrimary = Color('hsl(248, 67%, 64%)');
const colorSecondary = Color('hsl(51, 98%, 48%)');
const colorClickable = Color('hsl(248, 67%, 64%)');
const colorText = Color('hsl(201, 13%, 21%)');
const colorBackground = Color('hsl(201, 2%, 92%)');
const colorBorder = Color('hsl(201, 13%, 79%)');

// Darker color variations:
// - Brightness
// + Saturation
// Hue (often) shifts towards a luminosity minimum (red, green, or blue)

// Lighter color variations:
// + Brightness
// - Saturation
// Hue (often) shifts towards a luminosity maximum

const theme = {
  color: {
    primary: {
      default: colorPrimary.string(),
      darker: colorPrimary
        .lightness(-0.08)
        .saturate(0.03)
        .string(),
      darkest: colorPrimary
        .lightness(-0.42)
        .saturate(0.05)
        .string(),
      lighter: colorPrimary
        .lightness(0.08)
        .desaturate(0.08)
        .string(),
      lightest: colorPrimary
        .lightness(0.34)
        .desaturate(0.13)
        .string(),
    },
    secondary: {
      default: colorSecondary.string(),
      darker: colorSecondary
        .lightness(-0.13)
        .saturate(0.03)
        .string(),
      darkest: colorSecondary
        .lightness(-0.34)
        .saturate(0.05)
        .string(),
      lighter: colorSecondary
        .lightness(0.13)
        .desaturate(0.08)
        .string(),
      lightest: colorSecondary
        .lightness(0.34)
        .desaturate(0.13)
        .string(),
    },
    clickable: {
      // colors for clickable items (links, buttons, etc.)
      default: colorClickable.string(),
      highlight: 'hsl(248, 80%, 72%)',
      darker: 'hsl(248, 70%, 55%)',
    },
    text: {
      default: colorText.string(),
      lighter: 'hsl(201, 8%, 63%)',
      lightest: 'hsl(201, 8%, 89%)',
      inverse: 'hsl(0, 0%, 100%)',
    },
    background: {
      default: colorBackground.string(),
      darker: 'hsl(201, 5%, 76%)',
      darkest: 'hsl(201, 5%, 37%)',
      slightlyOffBlack: 'hsl(201, 2%, 8%)',
      lighter: 'hsl(201, 2%, 94%)',
      slightlyOffWhite: 'hsl(201, 1%, 97%)',
      white: 'hsl(0, 0%, 100%)',
      highlight: 'hsl(201, 100%, 94%)',
      warning: 'hsl(4, 90%, 94%)',
      overlay: 'hsla(201, 13%, 0%, 0.78)',
      clickable: 'hsla(248, 80%, 72%, 0.28)',
    },
    border: {
      default: colorBorder.string(),
      darker: 'hsl(201, 13%, 71%)',
      lighter: 'hsl(201, 13%, 87%)',
      lightest: 'hsl(201, 13%, 92%)',
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
      default: `${borderRadius}px`,
      tiny: `${borderRadius - 2}px`,
      small: `${borderRadius - 1}px`,
      large: `${borderRadius * 2}px`,
      huge: `${borderRadius * 3}px`,
      circle: '50%',
      pill: '999px',
    },
    width: {
      default: `${borderWidth}px`,
      strong: `${borderWidth * 2}px`,
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
      bold: '600',
    },
  },
  size: {
    default: `${size}px`,
    tiny: `${size / 4}px`,
    small: `${size / 2}px`,
    large: `${size * 2}px`,
    huge: `${size * 4}px`,
  },
  transition: {
    style: {
      default: 'ease-in-out',
      dynamic: 'cubic-bezier(0.73, 0.01, 0, 1)',
      easeInOut: 'ease-in-out',
    },
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

export default theme;
