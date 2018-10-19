import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import Slider from 'rc-slider';

import i18n from '../../lib/i18n';

import {MEDIA_SOURCE_LOCAL, MEDIA_SOURCE_MJPEG} from './constants';

import Anchor from '../../components/Anchor';
import Circle from './Circle';
import Hint from '../../components_new/Hint';
import Image from './Image';
import Line from './Line';
import Padding from '../../components_new/Padding';
import Tooltip from '../../components/Tooltip';
import WebcamComponent from '../../components/Webcam';
// import WebcamOn from './components/WebcamOn';

import './index.scss';

class Webcam extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  mediaSource = null;

  refresh() {
    const {state} = this.props;
    const {mediaSource} = state;

    if (mediaSource === MEDIA_SOURCE_MJPEG) {
      // eslint-disable-next-line react/no-find-dom-node
      const el = ReactDOM.findDOMNode(this.mediaSource);
      el.src = '';

      setTimeout(() => {
        el.src = state.url;
      }, 10);
    }
  }

  render() {
    const {actions, state} = this.props;
    const {
      crosshair,
      deviceId,
      disabled,
      flipHorizontally,
      flipVertically,
      mediaSource,
      muted,
      rotation,
      scale,
      url,
    } = state;

    if (disabled) {
      return (
        <div className="webcam-off-container">
          <Padding>
            <svg role="img" viewBox="0 0 504.123 504.123" className="icon" style={{height: '140px', width: '140px'}}>
              <path
                style={{fill: '#e4e7e7'}}
                d="M376.516,465.526c0-39.385-55.532-71.68-124.455-71.68c-68.529,0-124.455,31.902-124.455,71.68 c0,21.268,55.532,38.597,124.455,38.597C320.591,504.123,376.516,486.794,376.516,465.526z"
              />
              <path
                style={{fill: '#b6b9b9'}}
                d="M252.061,393.846c-34.658,0-65.772,8.271-88.222,21.268c14.178,14.966,48.443,25.206,88.222,25.206 s74.043-10.634,88.222-25.206C317.833,401.723,286.719,393.846,252.061,393.846z"
              />
              <path
                style={{fill: '#e4e7e7'}}
                d="M252.061,0c113.034,0,204.8,91.766,204.8,204.8s-91.766,204.8-204.8,204.8s-204.8-91.766-204.8-204.8 S139.027,0,252.061,0z"
              />
              <path
                style={{fill: '#e2574c'}}
                d="M252.061,23.631c8.665,0,15.754,7.089,15.754,15.754s-7.089,15.754-15.754,15.754 c-8.665,0-15.754-7.089-15.754-15.754S243.396,23.631,252.061,23.631z"
              />
              <path
                style={{fill: '#324d5b'}}
                d="M252.061,78.769c-69.711,0-126.031,56.32-126.031,126.031s56.32,126.031,126.031,126.031 s126.031-56.32,126.031-126.031S321.771,78.769,252.061,78.769z"
              />
              <path
                style={{fill: '#233640'}}
                d="M252.061,110.277c-52.382,0-94.523,42.535-94.523,94.523c0,52.382,42.142,94.523,94.523,94.523 s94.523-42.142,94.523-94.523S304.443,110.277,252.061,110.277z"
              />
              <path
                style={{fill: '#2b414d'}}
                d="M252.061,133.908c-38.991,0-70.892,31.902-70.892,70.892s31.902,70.892,70.892,70.892 s70.892-31.902,70.892-70.892S291.052,133.908,252.061,133.908z"
              />
              <path
                style={{fill: '#233640'}}
                d="M252.061,169.354c-19.692,0-35.446,15.754-35.446,35.446s15.754,35.446,35.446,35.446 s35.446-15.754,35.446-35.446S271.753,169.354,252.061,169.354z"
              />
              <path
                style={{fill: '#5a6870'}}
                d="M242.214,185.108c5.514,0,9.846,4.332,9.846,9.846s-4.332,9.846-9.846,9.846 c-5.514,0-9.846-4.332-9.846-9.846S236.701,185.108,242.214,185.108z"
              />
              <path
                style={{fill: '#d2d5d5'}}
                d="M252.061,370.215c-106.338,0-193.772-81.132-204.012-185.108c-0.788,6.302-0.788,12.997-0.788,19.692 c0,113.034,91.766,204.8,204.8,204.8s204.8-91.766,204.8-204.8c0-6.695-0.394-13.391-0.788-19.692 C445.833,289.083,358.399,370.215,252.061,370.215z"
              />
            </svg>
            <Hint block className="u-padding-top">
              {i18n._('Webcam is off')}
            </Hint>
          </Padding>
        </div>
      );
    }

    const transformStyle = [
      'translate(-50%, -50%)',
      `rotateX(${flipVertically ? 180 : 0}deg)`,
      `rotateY(${flipHorizontally ? 180 : 0}deg)`,
      `rotate(${(rotation % 4) * 90}deg)`,
    ].join(' ');

    return (
      <div className="webcam-on-container">
        {mediaSource === MEDIA_SOURCE_LOCAL && (
          <div style={{width: '100%'}}>
            <WebcamComponent
              ref={ref => (this.mediaSource = ref)}
              className="center"
              style={{transform: transformStyle}}
              width={`${(100 * scale).toFixed(0)}%`}
              height="auto"
              muted={muted}
              video={deviceId ? deviceId : true}
            />
          </div>
        )}
        {mediaSource === MEDIA_SOURCE_MJPEG && (
          <Image
            ref={ref => (this.mediaSource = ref)}
            src={url}
            style={{
              transform: transformStyle,
              width: `${(100 * scale).toFixed(0)}%`,
            }}
            className="center"
          />
        )}
        {crosshair && (
          <div>
            <Line className={classcat(['center', 'line-shadow'])} length="100%" />
            <Line className={classcat(['center', 'line-shadow'])} length="100%" vertical />
            <Circle className={classcat(['center', 'line-shadow'])} diameter={20} />
            <Circle className={classcat(['center', 'line-shadow'])} diameter={40} />
          </div>
        )}
        <div className="toolbar">
          <div className="scale-text">{scale}x</div>
          <div className="pull-right">
            {mediaSource === MEDIA_SOURCE_LOCAL && (
              <Anchor className="btn-icon" onClick={actions.toggleMute}>
                <i
                  className={classcat([
                    'icon',
                    'inverted',
                    {
                      iconUnmute: !muted,
                      iconMute: muted,
                    },
                  ])}
                />
              </Anchor>
            )}
            <Tooltip content={i18n._('Rotate Left')} placement="top">
              <Anchor className={'btn-icon'} onClick={actions.rotateLeft}>
                <i className="icon inverted icon-rotate-left" />
              </Anchor>
            </Tooltip>
            <Tooltip content={i18n._('Rotate Right')} placement="top">
              <Anchor className={'btn-icon'} onClick={actions.rotateRight}>
                <i className="icon inverted icon-rotate-right" />
              </Anchor>
            </Tooltip>
            <Tooltip content={i18n._('Flip Horizontally')} placement="top">
              <Anchor className={'btn-icon'} onClick={actions.toggleFlipHorizontally}>
                <i className="icon inverted icon-flip-horizontally" />
              </Anchor>
            </Tooltip>
            <Tooltip content={i18n._('Flip Vertically')} placement="top">
              <Anchor className={'btn-icon'} onClick={actions.toggleFlipVertically}>
                <i className="icon inverted icon-flip-vertically" />
              </Anchor>
            </Tooltip>
            <Tooltip content={i18n._('Crosshair')} placement="top">
              <Anchor className={'btn-icon'} onClick={actions.toggleCrosshair}>
                <i className="icon inverted icon-crosshair" />
              </Anchor>
            </Tooltip>
          </div>
        </div>
        <div className="image-scale-slider">
          <Slider
            defaultValue={scale}
            min={0.1}
            max={10}
            step={0.1}
            tipFormatter={null}
            onChange={actions.changeImageScale}
          />
        </div>
      </div>
    );
  }
}

export default Webcam;
