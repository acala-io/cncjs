import classcat from 'classcat';
import colornames from 'colornames';
import Detector from 'three/examples/js/Detector';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import Repeatable from 'react-repeatable';
import styled from 'styled-components';

import i18n from '../../lib/i18n';

import icon3DView from './images/camera-3d-view.svg';
import iconFrontView from './images/camera-front-view.png';
import iconLeftSideView from './images/camera-left-side-view.png';
import iconMoveCamera from './images/move-camera.svg';
import iconRightSideView from './images/camera-right-side-view.png';
import iconRotateCamera from './images/rotate-camera.svg';
import iconTopView from './images/camera-top-view.png';
import iconZoomFit from './images/zoom-fit.svg';
import iconZoomIn from './images/zoom-in.svg';
import iconZoomOut from './images/zoom-out.svg';

import {CAMERA_MODE_PAN, CAMERA_MODE_ROTATE} from './constants';

import ButtonGroup from '../../components_new/ButtonGroup';
import Dropdown, {MenuItem} from '../../components/Dropdown';
import Image from '../../components/Image';
import Interpolate from '../../components/Interpolate';
import Space from '../../components/Space';
import {Button} from '../../components/Buttons';
import {Tooltip} from '../../components/Tooltip';

const IconButton = styled(Button)`
  background-color: inherit;
  background-image: none;
  cursor: pointer;
  display: inline-block;
  font-weight: normal;
  margin-bottom: 0;
  padding: 8px;
  text-align: center;
  touch-action: manipulation;
  user-select: none;
  white-space: nowrap;

  && {
    border: 0;
    border-radius: 0;
  }

  filter: invert(40%);

  &.highlight,
  &:hover.highlight {
    background-color: rgba(255, 255, 255, 0.7);
    background-image: none;
    color: #333;
    filter: invert(100%);
    outline: 0;
    text-decoration: none;
  }

  &:hover {
    background-color: #e6e6e6;
    background-image: none;
    filter: invert(0%);
  }

  &:hover,
  &:focus,
  &:active {
    color: #333;
    outline: 0;
    text-decoration: none;
  }

  min-width: 36px; // 8px + 20px + 8px
  height: 36px; // 8px + 20px + 8px

  & + & {
    margin-left: 0;
  }
`;

class SecondaryToolbar extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {state} = this.props;
    const {disabled} = state;

    const canToggleOptions = Detector.webgl && !disabled;

    return (
      <div className="clearfix u-padding-tiny">
        {this.visualizationSettings}
        {canToggleOptions && (
          <div className="left">
            {this.cameraPositionSelect}
            <Space width="14" />
            {this.cameraModeSelect}
            <Space width="14" />
            {this.zoomFunctions}
          </div>
        )}
      </div>
    );
  }

  get visualizationSettings() {
    const {actions, state} = this.props;
    const {disabled, gcode, objects, projection} = state;

    const canToggleOptions = Detector.webgl && !disabled;

    return (
      <Dropdown className="right">
        <Button
          btnSize="sm"
          btnStyle="flat"
          title={!Detector.webgl || disabled ? i18n._('Enable 3D View') : i18n._('Disable 3D View')}
          onClick={actions.toggle3DView}
        >
          {!Detector.webgl || disabled ? <i className="fa fa-toggle-off" /> : <i className="fa fa-toggle-on" />}
          {i18n._('3D View')}
        </Button>
        <Dropdown.Toggle btnSize="sm" />
        <Dropdown.Menu>
          <MenuItem style={{color: '#222'}} header>
            <Interpolate
              format={'WebGL: {{status}}'}
              replacement={{
                status: Detector.webgl ? (
                  <span style={{color: colornames('royalblue')}}>{i18n._('Enabled')}</span>
                ) : (
                  <span style={{color: colornames('crimson')}}>{i18n._('Disabled')}</span>
                ),
              }}
            />
          </MenuItem>
          <MenuItem divider />
          <MenuItem header>{i18n._('Projection')}</MenuItem>
          <MenuItem disabled={!canToggleOptions} onSelect={actions.toPerspectiveProjection}>
            <i className={classcat(['fafa-fw', {'fa-check': projection !== 'orthographic'}])} />
            <Space width="4" />
            {i18n._('Perspective Projection')}
          </MenuItem>
          <MenuItem disabled={!canToggleOptions} onSelect={actions.toOrthographicProjection}>
            <i className={classcat(['fa fa-fw', {'fa-check': projection === 'orthographic'}])} />
            <Space width="4" />
            {i18n._('Orthographic Projection')}
          </MenuItem>
          <MenuItem divider />
          <MenuItem header>{i18n._('Scene Objects')}</MenuItem>
          <MenuItem disabled={!canToggleOptions} onSelect={actions.toggleGCodeFilename}>
            {gcode.displayName ? <i className="fa fa-toggle-on fa-fw" /> : <i className="fa fa-toggle-off fa-fw" />}
            <Space width="4" />
            {i18n._('Display G-code Filename')}
          </MenuItem>
          <MenuItem disabled={!canToggleOptions} onSelect={actions.toggleCoordinateSystemVisibility}>
            {objects.coordinateSystem.visible ? (
              <i className="fa fa-toggle-on fa-fw" />
            ) : (
              <i className="fa fa-toggle-off fa-fw" />
            )}
            <Space width="4" />
            {objects.coordinateSystem.visible ? i18n._('Hide Coordinate System') : i18n._('Show Coordinate System')}
          </MenuItem>
          <MenuItem disabled={!canToggleOptions} onSelect={actions.toggleGridLineNumbersVisibility}>
            {objects.gridLineNumbers.visible ? (
              <i className="fa fa-toggle-on fa-fw" />
            ) : (
              <i className="fa fa-toggle-off fa-fw" />
            )}
            <Space width="7" />
            {objects.gridLineNumbers.visible ? i18n._('Hide Grid Line Numbers') : i18n._('Show Grid Line Numbers')}
          </MenuItem>
          <MenuItem disabled={!canToggleOptions} onSelect={actions.toggleToolheadVisibility}>
            {objects.toolhead.visible ? (
              <i className="fa fa-toggle-on fa-fw" />
            ) : (
              <i className="fa fa-toggle-off fa-fw" />
            )}
            <Space width="7" />
            {objects.toolhead.visible ? i18n._('Hide Toolhead') : i18n._('Show Toolhead')}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  get cameraPositionSelect() {
    const {actions, state} = this.props;
    const {cameraPosition} = state;
    const {camera} = actions;

    return (
      <ButtonGroup
        optionName="camera-position"
        options={[
          {
            label: (
              <Tooltip placement="top" content={i18n._('Top View')} hideOnClick>
                <Image src={iconTopView} width="20" height="20" />
              </Tooltip>
            ),
            value: 'top',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Front View')} hideOnClick>
                <Image src={iconFrontView} width="20" height="20" />
              </Tooltip>
            ),
            value: 'front',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Right Side View')} hideOnClick>
                <Image src={iconRightSideView} width="20" height="20" />
              </Tooltip>
            ),
            value: 'right',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Left Side View')} hideOnClick>
                <Image src={iconLeftSideView} width="20" height="20" />
              </Tooltip>
            ),
            value: 'left',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('3D View')} hideOnClick>
                <Image src={icon3DView} width="20" height="20" />
              </Tooltip>
            ),
            value: '3d',
          },
        ]}
        selectedValue={cameraPosition}
        onChange={e => {
          switch (e) {
            case 'top':
              camera.toTopView();
              break;

            case 'front':
              camera.toFrontView();
              break;

            case 'right':
              camera.toRightSideView();
              break;

            case 'left':
              camera.toLeftSideView();
              break;

            case '3d':
              camera.to3DView();
              break;
          }
        }}
      />
    );
  }

  get zoomFunctions() {
    const {camera} = this.props.actions;

    return (
      <div className="inline-block">
        <Repeatable componentClass={IconButton} onClick={camera.zoomIn} onHold={camera.zoomIn}>
          <Tooltip placement="top" content={i18n._('Zoom In')} hideOnClick>
            <Image src={iconZoomIn} width="20" height="20" />
          </Tooltip>
        </Repeatable>
        <Repeatable componentClass={IconButton} onClick={camera.zoomOut} onHold={camera.zoomOut}>
          <Tooltip placement="top" content={i18n._('Zoom Out')} hideOnClick>
            <Image src={iconZoomOut} width="20" height="20" />
          </Tooltip>
        </Repeatable>
        <Repeatable componentClass={IconButton} onClick={camera.zoomFit} onHold={camera.zoomFit}>
          <Tooltip placement="top" content={i18n._('Zoom to Fit')} hideOnClick>
            <Image src={iconZoomFit} width="20" height="20" />
          </Tooltip>
        </Repeatable>
      </div>
    );
  }

  get cameraModeSelect() {
    const {actions, state} = this.props;
    const {cameraMode} = state;
    const {camera} = actions;

    return (
      <ButtonGroup
        optionName="camera-mode"
        options={[
          {
            label: (
              <Tooltip placement="top" content={i18n._('Move the camera')} hideOnClick>
                <Image src={iconMoveCamera} width="20" height="20" />
              </Tooltip>
            ),
            value: CAMERA_MODE_PAN,
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Rotate the camera')} hideOnClick>
                <Image src={iconRotateCamera} width="20" height="20" />
              </Tooltip>
            ),
            value: CAMERA_MODE_ROTATE,
          },
        ]}
        selectedValue={cameraMode}
        onChange={e => {
          alert('FIXME: Switching camera mode is broken; visualization is always in rotate camera mode');
          if (e === CAMERA_MODE_PAN) {
            camera.toPanMode();
          } else if (e === CAMERA_MODE_ROTATE) {
            camera.toRotateMode();
          }
        }}
      />
    );
  }
}

export default SecondaryToolbar;
