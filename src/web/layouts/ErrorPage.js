import React from 'react';

import i18n from '../lib/i18n';

const ErrorPage = () => (
  <div className="error-page">
    <h1 className="error-page__heading">404</h1>
    <div className="error-page__explanation">{i18n._('problem')}</div>
    <div className="error-page__action">
      <a href="/#/">{i18n._('Back to Homepage')}</a>
    </div>
  </div>
);

export default ErrorPage;
