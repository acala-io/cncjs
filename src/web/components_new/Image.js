import React from 'react';
import {string} from 'prop-types';

const Image = ({alt = '', src = '', ...props}) => <img alt={alt} src={src} {...props} />;

Image.propTypes = {
  alt: string,
  src: string,
};

export default Image;
