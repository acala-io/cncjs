import React from 'react';

import i18n from '../../../lib/i18n';

import './index.scss';

const HelpContainer = () => (
  <div className="help-container">
    <button
      type="button"
      className="btn btn-default"
      onClick={() => {
        const url = 'https://github.com/cncjs/cncjs/releases';
        window.open(url, '_blank');
      }}
    >
      {i18n._('Downloads')}
    </button>
    <button
      type="button"
      className="btn btn-default"
      onClick={() => {
        const url = 'https://github.com/cncjs/cncjs/issues';
        window.open(url, '_blank');
      }}
    >
      {i18n._('Report an issue')}
    </button>
  </div>
);

export default HelpContainer;
