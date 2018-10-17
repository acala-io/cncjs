import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import jogButtonFactory from './jogButtonFactory';

class KeypadZ extends PureComponent {
  static propTypes = {
    height: PropTypes.string,
  };

  static defaultProps = {
    height: '200px',
  };

  render() {
    return (
      <div className="keypad">
        <svg
          role="img"
          viewBox="0 0 130.8 423.7"
          className="keypad-image keypad-image--z"
          style={{height: this.props.height}}
        >
          <radialGradient id="SVGID_2_" cx="65.1399" cy="211.8629" r="148.3404" gradientUnits="userSpaceOnUse">
            <stop offset="0.3462" style={{stopColor: '#1C92C9'}} />
            <stop offset="1" style={{stopColor: '#007BC7'}} />
          </radialGradient>

          <path
            className="keypad-image__button"
            style={{fill: 'url(#SVGID_2_)'}}
            d="M129.5,128.3L129.5,128.3c-0.1-0.7-7.7-95.4-7.7-95.4c-0.5-7.7-6.2-14.1-13.7-15.6l0,0
            c-13.8-3-28.2-4.7-42.9-4.7S36,14.2,22.2,17.3l0,0c-7.4,1.5-13.1,7.8-13.7,15.6c0,0-7.6,94.7-7.7,95.4h0
            C-1,138.4-1,285.3,0.8,295.5h0c0.1,0.7,7.7,95.4,7.7,95.4c0.5,7.7,6.2,14.1,13.7,15.6l0,0c13.8,3,28.2,4.7,42.9,4.7
            s29.1-1.6,42.9-4.7l0,0c7.4-1.5,13.1-7.8,13.7-15.6c0,0,7.6-94.7,7.7-95.4h0C131.3,285.3,131.3,138.4,129.5,128.3z"
          />

          <path
            className="keypad-image__arrow"
            d="M65.1,44.6c0.4,0,1.3,0.1,1.8,1.1L79.8,68c0.6,1,0.2,1.8,0,2.1c-0.2,0.3-0.7,1.1-1.8,1.1H52.3
            c-1.1,0-1.6-0.7-1.8-1.1c-0.2-0.3-0.6-1.2,0-2.1l12.9-22.3C63.9,44.7,64.8,44.6,65.1,44.6 M65.1,42.6c-1.4,0-2.8,0.7-3.6,2.1
            L48.7,67c-1.6,2.7,0.4,6.2,3.6,6.2H78c3.2,0,5.1-3.4,3.6-6.2L68.7,44.7C67.9,43.3,66.5,42.6,65.1,42.6L65.1,42.6z"
          />
          <path
            className="keypad-image__arrow"
            d="M78,352.6c1.1,0,1.6,0.7,1.8,1.1s0.6,1.2,0,2.1L67,378c-0.6,1-1.5,1.1-1.8,1.1s-1.3-0.1-1.8-1.1l-12.9-22.3
            c-0.6-1-0.2-1.8,0-2.1c0.2-0.3,0.7-1.1,1.8-1.1H78 M78,350.6H52.3c-3.2,0-5.1,3.4-3.6,6.2L61.6,379c0.8,1.4,2.2,2.1,3.6,2.1
            c1.4,0,2.8-0.7,3.6-2.1l12.9-22.3C83.2,354,81.2,350.6,78,350.6L78,350.6z"
          />
        </svg>
        <div className="keypad__axis-label">Z</div>
        <div className="keypad-button__wrapper">
          {jogButtonFactory(this.props, {direction: '+', name: 'z'})}
          {jogButtonFactory(this.props, {direction: '-', name: 'z'})}
        </div>
      </div>
    );
  }
}

export default KeypadZ;
