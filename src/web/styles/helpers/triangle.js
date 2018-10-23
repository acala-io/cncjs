const triangle = (direction = 'down', color = 'currentcolor', size = '1em') => {
  let borderColor;
  switch (direction) {
    case 'up':
      borderColor = `transparent transparent ${color} transparent`;
      break;

    case 'right':
      borderColor = `transparent transparent transparent ${color}`;
      break;

    case 'left':
      borderColor = `transparent ${color} transparent transparent`;
      break;

    case 'down':
    default:
      borderColor = `${color} transparent transparent transparent`;
  }

  return `
    border-color: ${borderColor};
    border-style: solid;
    border-width: ${size};
    content: '';
    height: 0;
    width: 0;
  `;
};

export default triangle;
