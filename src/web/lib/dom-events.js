export const preventDefault = e => {
  if (typeof e.preventDefault !== 'undefined') {
    e.preventDefault();
  } else {
    e.returnValue = false;
  }
};

export const stopPropagation = e => {
  if (typeof e.stopPropagation !== 'undefined') {
    e.stopPropagation();
  } else {
    e.cancelBubble = true;
  }
};

export const addEventListener = (target, type, listener) => {
  target.addEventListener(type, listener, false);
};

export const removeEventListener = (target, type, listener) => {
  target.removeEventListener(type, listener, false);
};
