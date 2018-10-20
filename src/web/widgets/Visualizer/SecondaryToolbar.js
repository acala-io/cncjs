import classcat from 'classcat';
import colornames from 'colornames';
import Detector from 'three/examples/js/Detector';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import Repeatable from 'react-repeatable';
import styled from 'styled-components';

import i18n from '../../lib/i18n';

import {CAMERA_MODE_PAN, CAMERA_MODE_ROTATE} from './constants';

import ButtonGroup from '../../components_new/ButtonGroup';
import Dropdown, {MenuItem} from '../../components/Dropdown';
import Icon from '../../components_new/Icon';
import Interpolate from '../../components/Interpolate';
import Space from '../../components/Space';
import Tooltip from '../../components/Tooltip';
import {Button} from '../../components/Buttons';

import mixin from '../../styles/mixins';

const HiddenToolbar = styled(props => <div {...props} />)`
  ${mixin.pinBottomLeft} opacity: 0.08;
  width: 100%;

  :hover {
    opacity: 1;
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
      <HiddenToolbar className="clearfix u-padding">
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
      </HiddenToolbar>
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
                <Icon name="view-top" />
              </Tooltip>
            ),
            value: 'top',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Front View')} hideOnClick>
                <Icon name="view-front" />
              </Tooltip>
            ),
            value: 'front',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Left Side View')} hideOnClick>
                <Icon name="view-left" />
              </Tooltip>
            ),
            value: 'left',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Right Side View')} hideOnClick>
                <Icon name="view-right" />
              </Tooltip>
            ),
            value: 'right',
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('3D View')} hideOnClick>
                <Icon name="view-3d" />
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
      <div className="button-group">
        <label className="button-group__button">
          <Repeatable onMouseDown={camera.zoomIn} onHold={camera.zoomIn}>
            <Tooltip placement="top" content={i18n._('Zoom In')} hideOnClick>
              <Icon name="zoom-in" />
            </Tooltip>
          </Repeatable>
        </label>
        <label className="button-group__button">
          <Repeatable onMouseDown={camera.zoomOut} onHold={camera.zoomOut}>
            <Tooltip placement="top" content={i18n._('Zoom Out')} hideOnClick>
              <Icon name="zoom-out" />
            </Tooltip>
          </Repeatable>
        </label>
        <label className="button-group__button" onMouseDown={camera.zoomFit}>
          <Tooltip placement="top" content={i18n._('Zoom to Fit')} hideOnClick>
            <Icon name="zoom-fit" />
          </Tooltip>
        </label>
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
                <Icon name="camera-move" />
              </Tooltip>
            ),
            value: CAMERA_MODE_PAN,
          },
          {
            label: (
              <Tooltip placement="top" content={i18n._('Rotate the camera')} hideOnClick>
                <Icon name="camera-rotate" />
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
