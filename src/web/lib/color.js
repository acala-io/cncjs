import Color from 'color';

// Color.lightness lightness works absolutely shit;
// to achieve the desired change while keeping the API consistent (i.e. input values like '0.21'), we multiply by 100
export const lighten = (color, amount) =>
  Color(color)
    .lightness(amount * 100)
    .string();

export const darken = (color, amount) =>
  Color(color)
    .darken(amount)
    .string();

export const transparentize = (color, amount) =>
  Color(color)
    .fade(amount)
    .string();
