import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';
import portal from '../../lib/portal';

import {MEDIA_SOURCE_LOCAL} from './constants';

import Settings from './Settings';
import Space from '../../components/Space';
import Webcam from './Webcam';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import styles from './index.styl';

class WebcamWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
  };

  collapse = () => {
    this.setState({minimized: true});
  };

  expand = () => {
    this.setState({minimized: false});
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
    const {widgetId} = this.props;
    const {disabled, minimized, isFullscreen} = this.state;
    const state = {...this.state};
    const actions = {...this.actions};

    return (
      <Widget fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>{i18n._('Webcam')}</Widget.Title>
          <Widget.Controls>
            <Widget.Button
              title={disabled ? i18n._('Enable') : i18n._('Disable')}
              type="default"
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
            </Widget.Button>
            <Widget.Button disabled={disabled} title={i18n._('Refresh')} onClick={() => this.webcam.refresh()}>
              <i className="fa fa-refresh" />
            </Widget.Button>
            <Widget.Button
              title={i18n._('Edit')}
              onClick={event => {
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
            </Widget.Button>
            <Widget.Button
              disabled={isFullscreen}
              title={minimized ? i18n._('Expand') : i18n._('Collapse')}
              onClick={actions.toggleMinimized}
            >
              <i
                className={classcat([
                  'fa fa-fw',
                  {
                    'fa-chevron-up': !minimized,
                    'fa-chevron-down': minimized,
                  },
                ])}
              />
            </Widget.Button>

            <Widget.Button
              disabled={isFullscreen}
              title={isFullscreen ? i18n._('Exit Full Screen') : i18n._('Enter Full Screen')}
              onClick={() => actions.toggleFullscreen()}
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
            </Widget.Button>
          </Widget.Controls>
        </Widget.Header>
        <Widget.Content
          className={classcat([
            styles.widgetContent,
            {
              [styles.hidden]: minimized,
              [styles.fullscreen]: isFullscreen,
            },
          ])}
        >
          <Webcam
            ref={node => {
              this.webcam = node;
            }}
            state={state}
            actions={actions}
          />
        </Widget.Content>
      </Widget>
    );
  }

  actions = {
    toggleFullscreen: () => {
      const {minimized, isFullscreen} = this.state;
      this.setState({
        minimized: isFullscreen ? minimized : false,
        isFullscreen: !isFullscreen,
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

  componentDidUpdate(prevProps, prevState) {
    const {
      disabled,
      minimized,
      mediaSource,
      deviceId,
      url,
      scale,
      rotation,
      flipHorizontally,
      flipVertically,
      crosshair,
      muted,
    } = this.state;

    this.config.set('disabled', disabled);
    this.config.set('minimized', minimized);
    this.config.set('mediaSource', mediaSource);
    this.config.set('deviceId', deviceId);
    this.config.set('url', url);
    this.config.set('geometry.scale', scale);
    this.config.set('geometry.rotation', rotation);
    this.config.set('geometry.flipHorizontally', flipHorizontally);
    this.config.set('geometry.flipVertically', flipVertically);
    this.config.set('crosshair', crosshair);
    this.config.set('muted', muted);
  }
}

export default WebcamWidget;
