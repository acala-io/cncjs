import PropTypes from 'prop-types';
import React from 'react';

import i18n from '../../../lib/i18n';

import settings from '../../../config/settings';

import Anchor from '../../../components/Anchor';

import './index.scss';

const AboutContainer = ({version}) => {
  const wiki = 'https://github.com/cncjs/cncjs/wiki';

  return (
    <div className="about-container">
      <img src="images/logo-square-256x256.png" alt="" className="product-logo" />
      <div className="product-details">
        <div className="about-product-name">{`${settings.productName} ${version.current}`}</div>
        <div className="about-product-description">
          {i18n._('A web-based interface for CNC milling controller running Grbl, Smoothieware, or TinyG')}
        </div>
        <Anchor className="learn-more" href={wiki} target="_blank">
          {i18n._('Learn more')}
          <i className="fa fa-arrow-circle-right" style={{marginLeft: 5}} />
        </Anchor>
      </div>
    </div>
  );
};

AboutContainer.propTypes = {
  version: PropTypes.object,
};

export default AboutContainer;
