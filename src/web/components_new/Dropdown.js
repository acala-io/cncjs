import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

const Dropdown = ({additionalOptions, visibleOption}) => {
  return (
    <div className="dropdown">
      <span className="text--lighter">
        {visibleOption}
        <Icon name="show-hide" size="tiny" className="u-margin-right-small" />
      </span>
      <ul className="dropdown__items o-list-bare">
        {additionalOptions.map((o, i) => (
          <li key={i} className="o-list__item">
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
};

Dropdown.propTypes = {
  additionalOptions: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  visibleOption: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default Dropdown;
