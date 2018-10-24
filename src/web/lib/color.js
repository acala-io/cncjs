import Color from 'color';

export const transparentize = (color, amount) =>
  Color(color)
    .fade(amount)
    .string();
