import classcat from 'classcat';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './widgets.styl';

import Widget from './Widget';

const DefaultWidgets = ({className, defaultWidgets}) => (
  <div className={classcat([className, styles.widgets])}>
    {defaultWidgets.map(id => (
      <div data-widget-id={id} key={id}>
        <Widget widgetId={id} />
      </div>
    ))}
  </div>
);

DefaultWidgets.propTypes = {
  className: PropTypes.string,
  defaultWidgets: PropTypes.array,
};

export default DefaultWidgets;
