/*
 * Global variables.
 */

import Color from 'color';

const transitionTimeMultiplier = 1; // scaling factor for development / debugging

// Base values for deriving variations
const borderRadius = 3;
const borderWidth = 1;

const globalSpacingUnit = 14;

const colorPrimary = Color('hsl(248, 67%, 64%)');
const colorSecondary = Color('hsl(100, 67%, 64%)');
const colorClickable = Color('hsl(207, 67%, 64%)');
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

export default {
  color: {
    primary: {
      default: colorPrimary.string(),
      darker: colorPrimary
        .darken(0.08)
        .saturate(0.03)
        .string(),
      darkest: colorPrimary
        .darken(0.42)
        .saturate(0.05)
        .string(),
      lighter: colorPrimary
        .lighten(0.08)
        .desaturate(0.08)
        .string(),
      lightest: colorPrimary
        .lighten(0.34)
        .desaturate(0.13)
        .string(),
    },
    secondary: {
      default: colorSecondary.string(),
      darker: colorSecondary
        .darken(0.13)
        .saturate(0.03)
        .string(),
      darkest: colorSecondary
        .darken(0.34)
        .saturate(0.05)
        .string(),
      lighter: colorSecondary
        .lighten(0.13)
        .desaturate(0.08)
        .string(),
      lightest: colorSecondary
        .lighten(0.34)
        .desaturate(0.13)
        .string(),
    },
    clickable: {
      // colors for clickable items (links, buttons, etc.)
      default: colorClickable.string(),
      highlight: colorClickable
        .lighten(0.05)
        .saturate(0.13)
        .string(),
      background: colorClickable
        .lighten(0.05)
        .saturate(0.13)
        .fade(0.72)
        .string(),
    },
    text: {
      default: colorText.string(),
      lighter: colorText
        .lighten(0.55)
        .desaturate(0.05)
        .string(),
      lightest: colorText
        .lighten(0.68)
        .desaturate(0.05)
        .string(),
      inverse: 'hsl(0, 0%, 100%)',
    },
    background: {
      default: colorBackground.string(),
      darker: colorBackground
        .darken(0.16)
        .saturate(0.03)
        .string(),
      darkest: colorBackground
        .darken(0.55)
        .saturate(0.03)
        .string(),
      slightlyOffBlack: 'hsl(201, 2%, 8%)',
      lighter: 'hsl(201, 2%, 94%)',
      slightlyOffWhite: 'hsl(201, 1%, 97%)',
      white: 'hsl(0, 0%, 100%)',
      highlight: 'hsl(201, 100%, 94%)',
      warning: 'hsl(4, 90%, 94%)',
    },
    border: {
      default: colorBorder.string(),
      darker: colorBorder.darken(0.08).string(),
      lighter: colorBorder.lighten(0.08).string(),
      lightest: colorBorder.lighten(0.13).string(),
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
      bold: '700',
    },
  },
  globalSpacingUnit: {
    default: `${globalSpacingUnit}px`,
    tiny: `${globalSpacingUnit / 4}px`,
    small: `${globalSpacingUnit / 2}px`,
    large: `${globalSpacingUnit * 2}px`,
    huge: `${globalSpacingUnit * 4}px`,
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
