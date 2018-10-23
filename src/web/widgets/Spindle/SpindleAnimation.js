import React, {PureComponent} from 'react';
import {oneOf, string} from 'prop-types';
// import styled from 'styled-components';

import './spindle-animation.scss';

class SpindleAnimation extends PureComponent {
  static propTypes = {
    coolant: oneOf(['off', 'mist', 'flood']),
    height: string,
    spindle: oneOf(['off', 'right', 'left']),
  };

  static defaultProps = {
    coolant: 'off',
    height: '200px',
    spindle: 'off',
  };

  render() {
    return (
      <svg
        id="spindle"
        className={this.props.spindle === 'left' ? 'reverse' : ''}
        role="img"
        viewBox="0 0 397.3 393.1"
        style={{height: this.props.height}}
      >
        {this.props.spindle === 'right' && (
          <g className="spindle__direction-wrapper1">
            <g className="spindle__direction-wrapper2">
              <path
                className="spindle__direction spindle__direction--right"
                d="M202.1,164.2c-57.5-2.2-105,43.9-105,100.9c0,7.1,0.7,14.2,2.2,21
                  c0.4,1.7,2.1,2.8,3.8,2.4l27-6.6c1.6-0.4,2.6-2,2.3-3.6c-0.9-4.3-1.3-8.7-1.3-13.2c0-38,31.8-68.7,70.2-66.9
                  c34.3,1.6,62.1,29.4,63.7,63.7c1.8,38.4-28.9,70.2-66.9,70.2c-2.7,0-5.4-0.2-8-0.5l3.4-11.9c0.6-2.3-1.4-4.4-3.7-3.8l-58.3,14.7
                  c-2.5,0.6-3.3,3.7-1.6,5.5l41.9,43.1c1.7,1.7,4.5,1,5.2-1.3l3.8-13.3c5.7,1,11.5,1.5,17.4,1.5c57,0,103.1-47.5,100.9-105
                  C297,208.7,254.5,166.2,202.1,164.2z"
              />
            </g>
          </g>
        )}
        {this.props.spindle === 'left' && (
          <g className="spindle__direction-wrapper1">
            <g className="spindle__direction-wrapper2">
              <path
                className="spindle__direction spindle__direction--left"
                d="M194.1,164.2c57.5-2.2,105,43.9,105,100.9c0,7.1-0.7,14.2-2.2,21
                  c-0.4,1.7-2.1,2.8-3.8,2.4l-27-6.6c-1.6-0.4-2.6-2-2.3-3.6c0.9-4.3,1.3-8.7,1.3-13.2c0-38-31.8-68.7-70.2-66.9
                  c-34.3,1.6-62.1,29.4-63.7,63.7c-1.8,38.4,28.9,70.2,66.9,70.2c2.7,0,5.4-0.2,8-0.5l-3.4-11.9c-0.6-2.3,1.4-4.4,3.7-3.8l58.3,14.7
                  c2.5,0.6,3.3,3.7,1.6,5.5l-41.9,43.1c-1.7,1.7-4.5,1-5.2-1.3l-3.8-13.3c-5.7,1-11.5,1.5-17.4,1.5c-57,0-103.1-47.5-100.9-105
                  C99.2,208.7,141.7,166.2,194.1,164.2z"
              />
            </g>
          </g>
        )}

        <g className="spindle__mill">
          <rect x="189.7" y="154.8" width="18" height="121.3" />
          <rect x="177.6" y="91.8" width="42.1" height="24.8" />
          <rect x="167.8" y="112.4" width="61.8" height="42.5" />
          <rect x="106.1" width="185.1" height="95.9" />
        </g>

        {this.props.coolant === 'mist' && (
          <path
            className="spindle__coolant spindle__coolant--mist"
            d="M294.5,181.4l-4-3.8l-114.3,96.8l0,0c-0.7,0.5-1,1.1-1,1.7c0,3.1,9.6,5.6,21.4,5.6c10.5,0,19.3-2,21.1-4.6l0,0L294.5,181.4z"
          />
        )}
        {this.props.coolant === 'flood' && (
          <path
            className="spindle__coolant spindle__coolant--flood"
            d="M294.5,181.4l-4-3.8l-133.9,94.5l0,0c-1.8,1.3-2.8,2.6-2.8,4c0,6.2,19.2,11.3,42.9,11.3c21.5,0,39.3-4.2,42.4-9.6l0,0L294.5,181.4z"
          />
        )}
        <path
          className="spindle__coolant-pipe"
          d="M382.8,56.5c6.7-6.4,11.4-14.8,13.1-24.4c-3.3-0.8-6.6-1.5-10-2V27h0
            c6.2-6.8,10.4-15.5,11.5-25.2c-7-1.2-14.1-1.8-21.4-1.8c-7.3,0-14.5,0.6-21.4,1.8c1.1,9.7,5.3,18.4,11.5,25.2h0v1.7
            c-4.3,0-8.6,0.3-12.9,0.7c0.4,9.1,3.6,17.5,8.8,24.5c-2.8-0.5-5.6-0.8-8.4-1.1c-1.5,9.6,0.2,19.1,4.4,27.3l0,0l-0.4,1.5
            c-3.8-1.8-7.7-3.5-11.6-4.9c-3.9,8.9-4.6,18.5-2.6,27.5l0,0l-0.7,1.3c-2.6-2.1-5.2-4-7.9-5.8c-5.9,7.7-9,16.9-9.3,26.1l0,0l-2,2.1
            c-4.5-2.8-10.4-1.9-13.9,2.2c-3.2,3.8-3.3,9.2-0.6,13.1l-20.8,33c-0.6,1-0.4,2.2,0.5,2.9l4.8,4c0.9,0.7,2.1,0.7,3-0.1l28.7-26.2
            c4.4,2.3,9.9,1.3,13.2-2.6c3.3-3.9,3.3-9.5,0.3-13.4l1.1-1.2l0,0c9.2-0.5,18.3-3.9,25.8-10.1c-2.5-3.4-5.2-6.7-8.1-9.9l3.1-5.4l0,0
            c8.8-2.8,16.7-8.3,22.5-16.1c-2.5-2.1-5.1-4.1-7.8-6l1.9-6.8l0,0c7.8-4.9,14.1-12.2,17.7-21.2c-3.9-1.8-8-3.5-12.2-4.9L382.8,56.5
            L382.8,56.5z"
        />
      </svg>
    );
  }
}

export default SpindleAnimation;
