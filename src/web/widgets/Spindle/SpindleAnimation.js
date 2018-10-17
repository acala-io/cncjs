import {oneOf, string} from 'prop-types';
import React, {PureComponent} from 'react';
// import styled from 'styled-components';

// import s from '../../styles/variables';

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
      <svg id="spindle" role="img" viewBox="0 0 393.1 393.1" style={{height: this.props.height}}>
        {this.props.spindle !== 'off' && (
          <g className="spindle__direction-wrapper1">
            <g className="spindle__direction-wrapper2">
              <path
                className="spindle__direction"
                d="M202.1,144.2c-57.5-2.2-105,43.9-105,100.9c0,7.1,0.7,14.2,2.2,21c0.4,1.7,2.1,2.8,3.8,2.4l27-6.6c1.6-0.4,2.6-2,2.3-3.6
                c-0.9-4.3-1.3-8.7-1.3-13.2c0-38,31.8-68.7,70.2-66.9c34.3,1.6,62.1,29.4,63.7,63.7c1.8,38.4-28.9,70.2-66.9,70.2
                c-2.7,0-5.4-0.2-8-0.5l3.4-11.9c0.6-2.3-1.4-4.4-3.7-3.8l-58.3,14.7c-2.5,0.6-3.3,3.7-1.6,5.5l41.9,43.1c1.7,1.7,4.5,1,5.2-1.3
                l3.8-13.3c5.7,1,11.5,1.5,17.4,1.5c57,0,103.1-47.5,100.9-105C297,188.7,254.5,146.2,202.1,144.2z"
              />
            </g>
          </g>
        )}
        <g className="spindle__mill">
          <rect x="106.1" y="0" width="185.1" height="69.2" />
          <rect x="167.8" y="69.2" width="61.8" height="44.9" />
          <rect x="189.7" y="114" width="18" height="142.1" />
        </g>
        <g className="spindle__coolant-pipe">
          <path
            d="M20.5,56.5C13.9,50.1,9.2,41.7,7.5,32.1c3.3-0.8,6.6-1.5,10-2V27h0C11.3,20.2,7.1,11.4,6,1.8C13,0.6,20.1,0,27.4,0
            c7.3,0,14.5,0.6,21.4,1.8c-1.1,9.7-5.3,18.4-11.5,25.2h0v1.7c4.3,0,8.6,0.3,12.9,0.7c-0.4,9.1-3.6,17.5-8.8,24.5
            c2.8-0.5,5.6-0.8,8.4-1.1c1.5,9.6-0.2,19.1-4.4,27.3l0,0l0.4,1.5c3.8-1.8,7.7-3.5,11.6-4.9c3.9,8.9,4.6,18.5,2.6,27.5l0,0l0.7,1.3
            c2.6-2.1,5.2-4,7.9-5.8c5.9,7.7,9,16.9,9.3,26.1l0,0l2,2.1c4.5-2.8,10.4-1.9,13.9,2.2c3.2,3.8,3.3,9.2,0.6,13.1l20.8,33
            c0.6,1,0.4,2.2-0.5,2.9l-4.8,4c-0.9,0.7-2.1,0.7-3-0.1l-28.7-26.2c-4.4,2.3-9.9,1.3-13.2-2.6c-3.3-3.9-3.3-9.5-0.3-13.4l-1.1-1.2
            l0,0c-9.2-0.5-18.3-3.9-25.8-10.1c2.5-3.4,5.2-6.7,8.1-9.9l-3.1-5.4l0,0c-8.8-2.8-16.7-8.3-22.5-16.1c2.5-2.1,5.1-4.1,7.8-6
            l-1.9-6.8l0,0C18.5,80.4,12.2,73,8.6,64c3.9-1.8,8-3.5,12.2-4.9L20.5,56.5L20.5,56.5z"
          />
          {this.props.coolant !== 'off' && <circle cx="20" cy="20" cr="10" />}
        </g>
      </svg>
    );
  }
}

export default SpindleAnimation;
