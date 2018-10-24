import theme from '../theme';

const spaceBetweenSelf = (size = 'default', direction = 'vertical') => {
  let margin;
  switch (direction) {
    case 'horizontal':
      margin = 'margin-left';
      break;

    case 'vertical':
    default:
      margin = 'margin-top';
  }

  return `
    & + & {
      ${margin}: ${theme.size[size] || theme.size.default};
    }
  `;
};

export default spaceBetweenSelf;
