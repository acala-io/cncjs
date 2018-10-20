import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import semver from 'semver';

import i18n from '../../../lib/i18n';

import settings from '../../../config/settings';

import Anchor from '../../../components/Anchor';
import Space from '../../../components/Space';

import './index.scss';

const UpdateStatus = props => {
  const {checking, current, latest, lastUpdate} = props;

  const newUpdateAvailable = checking === false && semver.lt(current, latest);

  if (checking) {
    return (
      <span>
        <span className="update-status-icon">
          <i className="fa fa-fw fa-spin fa-circle-o-notch" />
        </span>
        {i18n._('Checking for updates')} &hellip;
      </span>
    );
  }

  if (newUpdateAvailable) {
    return (
      <span className="update-status-container">
        <div className="update-status-icon warning">
          <i className="fa fa-exclamation-circle fa-fw" />
        </div>
        <div className="update-status-messageContainer">
          <div className="update-status-message">
            {i18n._('A new version of {{name}} is available', {name: settings.productName})}
          </div>
          <div className="release-latest">
            {i18n._('Version {{version}}', {version: latest})}
            <br />
            {moment(lastUpdate).format('LLL')}
          </div>
        </div>
        <div className="update-status-action-container">
          <Anchor href="https://github.com/cncjs/cncjs/releases" target="_blank">
            <span className="label">
              {i18n._('Latest version')}
              <Space width="8" />
              <i className="fa fa-external-link fa-fw" />
            </span>
          </Anchor>
        </div>
      </span>
    );
  }

  return <span>({i18n._('up to date')})</span>;
};

UpdateStatus.propTypes = {
  checking: PropTypes.bool,
  current: PropTypes.string,
  lastUpdate: PropTypes.string,
  latest: PropTypes.string,
};

export default UpdateStatus;
