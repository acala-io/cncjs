import classcat from 'classcat';
import colornames from 'colornames';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import Repeatable from 'react-repeatable';
import styled from 'styled-components';
import Detector from 'three/examples/js/Detector';

import i18n from '../../lib/i18n';

import iconTopView from './images/camera-top-view.png';
import icon3DView from './images/camera-3d-view.svg';
import iconFrontView from './images/camera-front-view.png';
import iconLeftSideView from './images/camera-left-side-view.png';
import iconRightSideView from './images/camera-right-side-view.png';
import iconZoomFit from './images/zoom-fit.svg';
import iconZoomIn from './images/zoom-in.svg';
import iconZoomOut from './images/zoom-out.svg';
import iconMoveCamera from './images/move-camera.svg';
import iconRotateCamera from './images/rotate-camera.svg';

import {CAMERA_MODE_PAN, CAMERA_MODE_ROTATE} from './constants';

import {Button, ButtonToolbar, ButtonGroup} from '../../components/Buttons';
import Dropdown, {MenuItem} from '../../components/Dropdown';
import Image from '../../components/Image';
import Interpolate from '../../components/Interpolate';
import Space from '../../components/Space';
import {Tooltip} from '../../components/Tooltip';

const IconButton = styled(Button)`
  display: inline-block;
  padding: 8px;
  margin-bottom: 0;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  background-image: none;
  background-color: inherit;

  && {
    border: 0;
    border-radius: 0;
  }

  filter: invert(40%);

  &.highlight,
  &:hover.highlight {
    background-image: none;
    background-color: rgba(255, 255, 255, 0.7);
    outline: 0;
    color: #333;
    text-decoration: none;
    filter: invert(100%);
  }

  &:hover {
    background-image: none;
    background-color: #e6e6e6;
    filter: invert(0%);
  }

  &:hover,
  &:focus,
  &:active {
    outline: 0;
    color: #333;
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
    const {actions, state} = this.props;
    const {cameraMode, cameraPosition, disabled, gcode, objects, projection, wcs} = state;
    const {camera} = actions;

    const canToggleOptions = Detector.webgl && !disabled;

    return (
      <Fragment>
        <Dropdown>
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
              <Space width="4" />
              {objects.gridLineNumbers.visible ? i18n._('Hide Grid Line Numbers') : i18n._('Show Grid Line Numbers')}
            </MenuItem>
            <MenuItem disabled={!canToggleOptions} onSelect={actions.toggleToolheadVisibility}>
              {objects.toolhead.visible ? (
                <i className="fa fa-toggle-on fa-fw" />
              ) : (
                <i className="fa fa-toggle-off fa-fw" />
              )}
              <Space width="4" />
              {objects.toolhead.visible ? i18n._('Hide Toolhead') : i18n._('Show Toolhead')}
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
        {canToggleOptions && (
          <ButtonToolbar className="pull-right">
            <ButtonGroup btnSize="sm">
              <IconButton className={classcat([{highlight: cameraPosition === 'top'}])} onClick={camera.toTopView}>
                <Tooltip placement="top" content={i18n._('Top View')} hideOnClick>
                  <Image src={iconTopView} width="20" height="20" />
                </Tooltip>
              </IconButton>
              <IconButton className={classcat([{highlight: cameraPosition === 'front'}])} onClick={camera.toFrontView}>
                <Tooltip placement="top" content={i18n._('Front View')} hideOnClick>
                  <Image src={iconFrontView} width="20" height="20" />
                </Tooltip>
              </IconButton>
              <IconButton
                className={classcat([{highlight: cameraPosition === 'right'}])}
                onClick={camera.toRightSideView}
              >
                <Tooltip placement="top" content={i18n._('Right Side View')} hideOnClick>
                  <Image src={iconRightSideView} width="20" height="20" />
                </Tooltip>
              </IconButton>
              <IconButton
                className={classcat([{highlight: cameraPosition === 'left'}])}
                onClick={camera.toLeftSideView}
              >
                <Tooltip placement="top" content={i18n._('Left Side View')} hideOnClick>
                  <Image src={iconLeftSideView} width="20" height="20" />
                </Tooltip>
              </IconButton>
              <IconButton className={classcat([{highlight: cameraPosition === '3d'}])} onClick={camera.to3DView}>
                <Tooltip placement="top" content={i18n._('3D View')} hideOnClick>
                  <Image src={icon3DView} width="20" height="20" />
                </Tooltip>
              </IconButton>
              <Repeatable componentClass={IconButton} onClick={camera.zoomFit} onHold={camera.zoomFit}>
                <Tooltip placement="top" content={i18n._('Zoom to Fit')} hideOnClick>
                  <Image src={iconZoomFit} width="20" height="20" />
                </Tooltip>
              </Repeatable>
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
            </ButtonGroup>
            <Dropdown
              componentClass={ButtonGroup}
              style={{marginLeft: 0}}
              dropup
              pullRight
              onSelect={eventKey => {
                if (eventKey === CAMERA_MODE_PAN) {
                  camera.toPanMode();
                } else if (eventKey === CAMERA_MODE_ROTATE) {
                  camera.toRotateMode();
                }
              }}
            >
              <Dropdown.Toggle componentClass={IconButton}>
                {cameraMode === CAMERA_MODE_PAN && <Image src={iconMoveCamera} width="20" height="20" />}
                {cameraMode === CAMERA_MODE_ROTATE && <Image src={iconRotateCamera} width="20" height="20" />}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <MenuItem eventKey={CAMERA_MODE_PAN}>
                  <Image src={iconMoveCamera} width="20" height="20" />
                  <Space width="4" />
                  {i18n._('Move the camera')}
                </MenuItem>
                <MenuItem eventKey={CAMERA_MODE_ROTATE}>
                  <Image src={iconRotateCamera} width="20" height="20" />
                  <Space width="4" />
                  {i18n._('Rotate the camera')}
                </MenuItem>
              </Dropdown.Menu>
            </Dropdown>
          </ButtonToolbar>
        )}
      </Fragment>
    );
  }
}

export default SecondaryToolbar;
