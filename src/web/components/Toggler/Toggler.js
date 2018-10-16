import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import Anchor from '../Anchor';

import styles from './index.styl';

class Toggler extends PureComponent {
  static propTypes = {
    onToggle: PropTypes.func.isRequired,
  };

  render() {
    const {onToggle, className, ...props} = this.props;

    return <Anchor {...props} className={classcat([className, styles.toggler])} onClick={onToggle} />;
  }
}

export default Toggler;
