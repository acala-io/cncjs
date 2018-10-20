import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import jogButtonFactory from '../jogButtonFactory';
import AxisLabel from './AxisLabel';
import Flexbox from '../../../components_new/Flexbox';

class KeypadZ extends PureComponent {
  static propTypes = {
    height: PropTypes.string,
  };

  static defaultProps = {
    height: '168px',
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
          <defs>
            <radialGradient
              id="svg-radial-gradient"
              cx="211.8629"
              cy="211.8629"
              r="211.8629"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.21" style={{stopColor: 'hsl(207, 67%, 64%)'}} />
              <stop offset="1" style={{stopColor: 'hsl(207, 69%, 62%)'}} />
            </radialGradient>
            <radialGradient
              id="svg-radial-gradient--darker"
              cx="211.8629"
              cy="211.8629"
              r="211.8629"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.34" style={{stopColor: 'hsl(207, 67%, 63%)'}} />
              <stop offset="1" style={{stopColor: 'hsl(207, 69%, 58%)'}} />
            </radialGradient>
            <filter id="svg-dropshadow" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="1" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.13" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* https://www.xanthir.com/b4Yv0 */}
            <filter id="svg-dropshadow--inset" x="-50%" y="-50%" width="200%" height="200%">
              <feComponentTransfer in="SourceAlpha">
                <feFuncA type="table" tableValues="0.8 0" />
              </feComponentTransfer>
              <feGaussianBlur stdDeviation="3" />
              <feOffset dx="1" dy="1" result="offsetblur" />
              {/* <feFlood flood-color="rgb(20, 0, 0)" result="color"/> the shadow color */}
              <feComposite in2="offsetblur" operator="in" />
              <feComposite in2="SourceAlpha" operator="in" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode />
              </feMerge>
            </filter>
          </defs>

          <path
            className="keypad-image__button"
            d="M129.5,128.3L129.5,128.3c-0.1-0.7-7.7-95.4-7.7-95.4c-0.5-7.7-6.2-14.1-13.7-15.6l0,0
            c-13.8-3-28.2-4.7-42.9-4.7S36,14.2,22.2,17.3l0,0c-7.4,1.5-13.1,7.8-13.7,15.6c0,0-7.6,94.7-7.7,95.4h0
            C-1,138.4-1,285.3,0.8,295.5h0c0.1,0.7,7.7,95.4,7.7,95.4c0.5,7.7,6.2,14.1,13.7,15.6l0,0c13.8,3,28.2,4.7,42.9,4.7
            s29.1-1.6,42.9-4.7l0,0c7.4-1.5,13.1-7.8,13.7-15.6c0,0,7.6-94.7,7.7-95.4h0C131.3,285.3,131.3,138.4,129.5,128.3z"
          />

          <path
            className="keypad-image__arrow"
            d="M61.6,44.7L48.7,67c-1.6,2.7,0.4,6.2,3.6,6.2H78c3.2,0,5.1-3.4,3.6-6.2L68.7,44.7
            C67.1,41.9,63.2,41.9,61.6,44.7z"
          />
          <path
            className="keypad-image__arrow"
            d="M68.7,379l12.9-22.3c1.6-2.7-0.4-6.2-3.6-6.2H52.3c-3.2,0-5.1,3.4-3.6,6.2L61.6,379
            C63.2,381.8,67.1,381.8,68.7,379z"
          />
        </svg>
        <AxisLabel>Z</AxisLabel>
        <Flexbox alignContent="stretch" flexDirection="column" className="keypad-button__wrapper">
          {jogButtonFactory(this.props, {direction: '+', name: 'z'})}
          {jogButtonFactory(this.props, {direction: '-', name: 'z'})}
        </Flexbox>
      </div>
    );
  }
}

export default KeypadZ;
