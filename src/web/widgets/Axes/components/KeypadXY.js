import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import jogButtonFactory from '../jogButtonFactory';
import AxisLabel from './AxisLabel';
import Flexbox from '../../../components_new/Flexbox';

class KeypadXY extends PureComponent {
  static propTypes = {
    clicked: PropTypes.string,
    height: PropTypes.string,
  };

  static defaultProps = {
    height: '168px',
  };

  render() {
    const {clicked} = this.props;

    return (
      <div className="keypad">
        <svg
          role="img"
          viewBox="0 0 423.7 424.6"
          className={classcat([
            'keypad-image keypad-image--xy',
            {
              'tilted--x-plus': clicked === 'x-plus',
              'tilted--x-minus': clicked === 'x-minus',
              'tilted--y-plus': clicked === 'y-plus',
              'tilted--y-minus': clicked === 'y-minus',
              'tilted--x-plus-y-plus': clicked === 'x-plus-y-plus',
              'tilted--x-plus-y-minus': clicked === 'x-plus-y-minus',
              'tilted--x-minus-y-plus': clicked === 'x-minus-y-plus',
              'tilted--x-minus-y-minus': clicked === 'x-minus-y-minus',
            },
          ])}
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

          <circle className="keypad-image__button" cx="211.9" cy="211.9" r="211.9" />

          <path
            className="keypad-image__button keypad-image__button--inner"
            d="M406.4,168.9L406.4,168.9c-1.5-7.4-7.8-13.1-15.6-13.7l-93.4-7.5c-10.3-0.8-19.5-9.4-21.3-19.5h0
            c-0.1-0.7-7.7-95.4-7.7-95.4c-0.5-7.7-6.2-14.1-13.7-15.6l0,0c-13.8-3-28.2-4.7-42.9-4.7s-29.1,1.6-42.9,4.7l0,0
            c-7.4,1.5-13.1,7.8-13.7,15.6c0,0-7.6,94.7-7.7,95.4h0c-1.8,10.1-11,18.7-21.3,19.5l-93.4,7.5c-7.7,0.5-14.1,6.2-15.6,13.7l0,0
            c-3,13.8-4.7,28.2-4.7,42.9s1.6,29.1,4.7,42.9l0,0c1.5,7.4,7.8,13.1,15.6,13.7l93.4,7.5c10.3,0.8,19.5,9.4,21.3,19.5h0
            c0.1,0.7,7.7,95.4,7.7,95.4c0.5,7.7,6.2,14.1,13.7,15.6l0,0c13.8,3,28.2,4.7,42.9,4.7s29.1-1.6,42.9-4.7l0,0
            c7.4-1.5,13.1-7.8,13.7-15.6c0,0,7.6-94.7,7.7-95.4h0c1.8-10.1,11-18.7,21.3-19.5l93.4-7.5c7.7-0.5,14.1-6.2,15.6-13.7l0,0
            c3-13.8,4.7-28.2,4.7-42.9S409.5,182.8,406.4,168.9z"
          />

          <path
            className="keypad-image__arrow"
            d="M208.3,44.7L195.4,67c-1.6,2.7,0.4,6.2,3.6,6.2h25.8c3.2,0,5.1-3.4,3.6-6.2l-12.9-22.3
            C213.8,41.9,209.9,41.9,208.3,44.7z"
          />
          <path
            className="keypad-image__arrow"
            d="M215.4,379l12.9-22.3c1.6-2.7-0.4-6.2-3.6-6.2H199c-3.2,0-5.1,3.4-3.6,6.2l12.9,22.3
            C209.9,381.8,213.8,381.8,215.4,379z"
          />
          <path
            className="keypad-image__arrow"
            d="M379,208.3l-22.3-12.9c-2.7-1.6-6.2,0.4-6.2,3.6v25.8c0,3.2,3.4,5.1,6.2,3.6l22.3-12.9
            C381.8,213.8,381.8,209.9,379,208.3z"
          />
          <path
            className="keypad-image__arrow"
            d="M44.7,215.4L67,228.3c2.7,1.6,6.2-0.4,6.2-3.6V199c0-3.2-3.4-5.1-6.2-3.6l-22.3,12.9
            C41.9,209.9,41.9,213.8,44.7,215.4z"
          />
        </svg>
        <AxisLabel>XY</AxisLabel>
        <Flexbox flexDirection="column" alignContent="stretch" className="keypad-button__wrapper">
          <Flexbox flexDirection="row" alignContent="stretch" flexGrow={1}>
            {jogButtonFactory(this.props, {direction: '-', name: 'x'}, {direction: '-', name: 'Y'})}
            {jogButtonFactory(this.props, {direction: '-', name: 'y'})}
            {jogButtonFactory(this.props, {direction: '+', name: 'x'}, {direction: '-', name: 'y'})}
          </Flexbox>
          <Flexbox flexDirection="row" alignContent="stretch" flexGrow={1}>
            {jogButtonFactory(this.props, {direction: '-', name: 'x'})}
            <Flexbox flexGrow={1} />
            {jogButtonFactory(this.props, {direction: '+', name: 'x'})}
          </Flexbox>
          <Flexbox flexDirection="row" alignContent="stretch" flexGrow={1}>
            {jogButtonFactory(this.props, {direction: '-', name: 'x'}, {direction: '+', name: 'y'})}
            {jogButtonFactory(this.props, {direction: '+', name: 'y'})}
            {jogButtonFactory(this.props, {direction: '+', name: 'x'}, {direction: '+', name: 'y'})}
          </Flexbox>
        </Flexbox>
      </div>
    );
  }
}

export default KeypadXY;
