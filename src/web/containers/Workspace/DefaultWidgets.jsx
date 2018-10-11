import classNames from 'classnames';
import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import store from '../../store';
import styles from './widgets.styl';
import Widget from './Widget';

class DefaultWidgets extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  };

  render() {
    const {className} = this.props;
    const defaultWidgets = ensureArray(store.get('workspace.container.default.widgets'));
    const widgets = defaultWidgets.map(widgetId => (
      <div data-widget-id={widgetId} key={widgetId}>
        <Widget widgetId={widgetId} />
      </div>
    ));

    return <div className={classNames(className, styles.widgets)}>{widgets}</div>;
  }
}

export default DefaultWidgets;
