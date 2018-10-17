import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';

import i18n from '../../lib/i18n';
import portal from '../../lib/portal';

import {MEDIA_SOURCE_LOCAL} from './constants';

import Card, {CardHeader} from '../../components_new/Card';
import Padding from '../../components_new/Padding';
import Settings from './Settings';
import Webcam from './Webcam';
import WidgetConfig from '../WidgetConfig';

import './index.scss';

class WebcamWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
  };

  collapse = () => {
    this.setState({
      minimized: true,
    });
  };

  expand = () => {
    this.setState({
      minimized: false,
    });
  };

  config = new WidgetConfig(this.props.widgetId);

  state = this.getInitialState();

  getInitialState() {
    return {
      crosshair: this.config.get('crosshair', false),
      deviceId: this.config.get('deviceId', ''),
      disabled: this.config.get('disabled', true),
      flipHorizontally: this.config.get('geometry.flipHorizontally', false),
      flipVertically: this.config.get('geometry.flipVertically', false),
      isFullscreen: false,
      mediaSource: this.config.get('mediaSource', MEDIA_SOURCE_LOCAL),
      minimized: this.config.get('minimized', false),
      muted: this.config.get('muted', false),
      rotation: this.config.get('geometry.rotation', 0),
      scale: this.config.get('geometry.scale', 1.0),
      url: this.config.get('url', ''),
    };
  }

  render() {
    const {isFullscreen, minimized} = this.state;
    const state = {...this.state};
    const actions = {...this.actions};

    // TODO: fullscreen={isFullscreen}

    return (
      <Card noPad shadow>
        <CardHeader>
          {this.widgetButtons}
          <h3 onMouseDown={isFullscreen ? () => {} : actions.toggleMinimized}>{i18n._('Webcam')}</h3>
        </CardHeader>
        <div className={classcat([{hidden: minimized}])}>
          <Padding size="small">
            <Webcam ref={ref => (this.webcam = ref)} state={state} actions={actions} />
          </Padding>
        </div>
      </Card>
    );
  }

  get widgetButtons() {
    const {disabled, isFullscreen} = this.state;

    return (
      <Fragment>
        <div
          className="right"
          title={disabled ? i18n._('Enable') : i18n._('Disable')}
          onClick={() => this.setState({disabled: !disabled})}
        >
          <i
            className={classcat([
              'fa fa-fw',
              {
                'fa-toggle-on': !disabled,
                'fa-toggle-off': disabled,
              },
            ])}
          />
        </div>
        {!disabled && (
          <div className="right" title={i18n._('Refresh')} onClick={() => this.webcam.refresh()}>
            <i className="fa fa-refresh" />
          </div>
        )}
        <div
          className="right"
          title={i18n._('Edit')}
          onClick={() => {
            const {mediaSource, deviceId, url} = this.state;

            portal(({onClose}) => (
              <Settings
                mediaSource={mediaSource}
                deviceId={deviceId}
                url={url}
                onSave={data => {
                  const {deviceId, mediaSource, url} = data;

                  this.setState({deviceId, mediaSource, url});
                  onClose();
                }}
                onCancel={onClose}
              />
            ));
          }}
        >
          <i className="fa fa-cog" />
        </div>

        <div
          className="right"
          title={isFullscreen ? i18n._('Exit Full Screen') : i18n._('Enter Full Screen')}
          onClick={this.actions.toggleFullscreen}
        >
          <i
            className={classcat([
              'fa fa-fw',
              {
                'fa-expand': !isFullscreen,
                'fa-compress': isFullscreen,
              },
            ])}
          />
        </div>
      </Fragment>
    );
  }

  actions = {
    toggleFullscreen: () => {
      const {minimized, isFullscreen} = this.state;
      this.setState({
        isFullscreen: !isFullscreen,
        minimized: isFullscreen ? minimized : false,
      });
    },
    toggleMinimized: () => {
      const {minimized} = this.state;
      this.setState({minimized: !minimized});
    },
    changeImageScale: value => {
      this.setState({scale: value});
    },
    rotateLeft: () => {
      const {flipHorizontally, flipVertically, rotation} = this.state;
      const rotateLeft = (flipHorizontally && flipVertically) || (!flipHorizontally && !flipVertically);
      const modulus = 4;
      const i = rotateLeft ? -1 : 1;
      this.setState({rotation: (Math.abs(Number(rotation || 0)) + modulus + i) % modulus});
    },
    rotateRight: () => {
      const {flipHorizontally, flipVertically, rotation} = this.state;
      const rotateRight = (flipHorizontally && flipVertically) || (!flipHorizontally && !flipVertically);
      const modulus = 4;
      const i = rotateRight ? 1 : -1;
      this.setState({rotation: (Math.abs(Number(rotation || 0)) + modulus + i) % modulus});
    },
    toggleFlipHorizontally: () => {
      const {flipHorizontally} = this.state;
      this.setState({flipHorizontally: !flipHorizontally});
    },
    toggleFlipVertically: () => {
      const {flipVertically} = this.state;
      this.setState({flipVertically: !flipVertically});
    },
    toggleCrosshair: () => {
      const {crosshair} = this.state;
      this.setState({crosshair: !crosshair});
    },
    toggleMute: () => {
      const {muted} = this.state;
      this.setState({muted: !muted});
    },
  };
  webcam = null;

  componentDidUpdate() {
    const {
      crosshair,
      deviceId,
      disabled,
      flipHorizontally,
      flipVertically,
      mediaSource,
      minimized,
      muted,
      rotation,
      scale,
      url,
    } = this.state;

    this.config.set('crosshair', crosshair);
    this.config.set('deviceId', deviceId);
    this.config.set('disabled', disabled);
    this.config.set('geometry.flipHorizontally', flipHorizontally);
    this.config.set('geometry.flipVertically', flipVertically);
    this.config.set('geometry.rotation', rotation);
    this.config.set('geometry.scale', scale);
    this.config.set('mediaSource', mediaSource);
    this.config.set('minimized', minimized);
    this.config.set('muted', muted);
    this.config.set('url', url);
  }
}

export default WebcamWidget;
