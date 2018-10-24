import Color from 'color';

export const lighten = (color, amount) =>
  Color(color)
    .lightness(amount)
    .string();

export const transparentize = (color, amount) =>
  Color(color)
    .fade(amount)
    .string();
