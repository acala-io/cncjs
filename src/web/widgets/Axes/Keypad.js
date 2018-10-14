import classcat from 'classcat';
import ensureArray from 'ensure-array';
import frac from 'frac';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import Repeatable from 'react-repeatable';
import styled from 'styled-components';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import Dropdown, {MenuItem} from '../../components/Dropdown';
import Fraction from './components/Fraction';
import Space from '../../components/Space';
import {Button} from '../../components/Buttons';

import {
  // Units
  IMPERIAL_UNITS,
  IMPERIAL_STEPS,
  METRIC_UNITS,
  METRIC_STEPS,
} from '../../constants';

import styles from './index.styl';

const KeypadText = styled.span`
  position: relative;
  display: inline-block;
  vertical-align: baseline;
`;

const KeypadDirectionText = styled(KeypadText)`
  min-width: 10px;
`;

const KeypadSubscriptText = styled(KeypadText)`
  min-width: 10px;
  font-size: 80%;
  line-height: 0;
`;

class Keypad extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  handleSelect = eventKey => {
    const commands = ensureArray(eventKey);
    commands.forEach(command => controller.command('gcode', command));
  };

  renderRationalNumberWithBoundedDenominator(value) {
    // https://github.com/SheetJS/frac
    const denominatorDigits = 4;
    const maximumDenominator = Math.pow(10, Number(denominatorDigits) || 0) - 1; // 10^4 - 1 = 9999
    const [quot, numerator, denominator] = frac(value, maximumDenominator, true);

    if (numerator > 0) {
      return (
        <span>
          {quot > 0 ? quot : ''}
          <Space width="2" />
          <Fraction numerator={numerator} denominator={denominator} />
        </span>
      );
    }

    return <span>{quot > 0 ? quot : ''}</span>;
  }

  render() {
    return (
      <div className={styles.keypad}>
        <div className="row no-gutters">
          <div>
            <div className={styles.rowSpace}>
              <div className="row no-gutters">
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXMinusYPlus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonYPlus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXPlusYPlus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonZPlus}</div>
                </div>
              </div>
            </div>
            <div className={styles.rowSpace}>
              <div className="row no-gutters">
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXMinus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXZeroYZero}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXPlus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonZZero}</div>
                </div>
              </div>
            </div>
            <div className={styles.rowSpace}>
              <div className="row no-gutters">
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXMinusYMinus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonYMinus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonXPlusYMinus}</div>
                </div>
                <div className="col-xs-3">
                  <div className={styles.colSpace}>{this.buttonZMinus}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={classcat([styles.rowSpace, 'u-margin-top'])}>{this.unitSelect}</div>
          <div className={styles.rowSpace}>{this.stepSize}</div>
          <div className={styles.rowSpace}>
            <div className="row no-gutters">
              <div className="col-xs-6">{this.buttonStepBackward}</div>
              <div className="col-xs-6">{this.buttonStepForward}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  get buttonXPlus() {
    const {actions} = this.props;
    const {axes, canClick, jog} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const highlightX = canClickX && (jog.keypad || jog.axis === 'x');

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        X: distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={classcat([styles.btnKeypad, {[styles.highlight]: highlightX}])}
        onClick={onJog}
        disabled={!canClickX}
        title={i18n._('Move X+')}
        compact
      >
        <KeypadText>X</KeypadText>
        <KeypadDirectionText>+</KeypadDirectionText>
      </Button>
    );
  }

  get buttonXPlusYPlus() {
    const {actions} = this.props;
    const {axes, canClick} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const canClickY = canClick && axes.includes('y');
    const canClickXY = canClickX && canClickY;

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        X: distance,
        Y: distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={styles.btnKeypad}
        onClick={onJog}
        disabled={!canClickXY}
        title={i18n._('Move X+ Y+')}
        compact
      >
        <i className={classcat(['fa fa-arrow-circle-up', styles['rotate-45deg']])} style={{fontSize: 16}} />
      </Button>
    );
  }

  get buttonXPlusYMinus() {
    const {actions} = this.props;
    const {axes, canClick} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const canClickY = canClick && axes.includes('y');
    const canClickXY = canClickX && canClickY;

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        X: distance,
        Y: -distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={styles.btnKeypad}
        onClick={onJog}
        disabled={!canClickXY}
        title={i18n._('Move X+ Y-')}
        compact
      >
        <i className={classcat(['fa', 'fa-arrow-circle-down', styles['rotate--45deg']])} style={{fontSize: 16}} />
      </Button>
    );
  }

  get buttonXMinus() {
    const {actions} = this.props;
    const {axes, canClick, jog} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const highlightX = canClickX && (jog.keypad || jog.axis === 'x');

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        X: -distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={classcat([styles.btnKeypad, {[styles.highlight]: highlightX}])}
        onClick={onJog}
        disabled={!canClickX}
        title={i18n._('Move X-')}
        compact
      >
        <KeypadText>X</KeypadText>
        <KeypadDirectionText>-</KeypadDirectionText>
      </Button>
    );
  }

  get buttonXMinusYPlus() {
    const {actions} = this.props;
    const {axes, canClick} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const canClickY = canClick && axes.includes('y');
    const canClickXY = canClickX && canClickY;

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        X: -distance,
        Y: distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={styles.btnKeypad}
        onClick={onJog}
        disabled={!canClickXY}
        title={i18n._('Move X- Y+')}
        compact
      >
        <i className={classcat(['fa fa-arrow-circle-up', styles['rotate--45deg']])} style={{fontSize: 16}} />
      </Button>
    );
  }

  get buttonXMinusYMinus() {
    const {actions} = this.props;
    const {axes, canClick} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const canClickY = canClick && axes.includes('y');
    const canClickXY = canClickX && canClickY;

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        X: -distance,
        Y: -distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={styles.btnKeypad}
        onClick={onJog}
        disabled={!canClickXY}
        title={i18n._('Move X- Y-')}
        compact
      >
        <i className={classcat(['fa', 'fa-arrow-circle-down', styles['rotate-45deg']])} style={{fontSize: 16}} />
      </Button>
    );
  }

  get buttonXZeroYZero() {
    const {actions} = this.props;
    const {axes, canClick} = this.props.state;

    const canClickX = canClick && axes.includes('x');
    const canClickY = canClick && axes.includes('y');
    const canClickXY = canClickX && canClickY;

    const gotoZero = () =>
      actions.move({
        X: 0,
        Y: 0,
      });

    return (
      <Button
        btnStyle="flat"
        className={styles.btnKeypad}
        onClick={gotoZero}
        disabled={!canClickXY}
        title={i18n._('Move To XY Zero (G0 X0 Y0)')}
        compact
      >
        <KeypadText>X</KeypadText>
        <KeypadSubscriptText>0</KeypadSubscriptText>
        <KeypadText>Y</KeypadText>
        <KeypadSubscriptText>0</KeypadSubscriptText>
      </Button>
    );
  }

  get buttonYPlus() {
    const {actions} = this.props;
    const {axes, canClick, jog} = this.props.state;

    const canClickY = canClick && axes.includes('y');
    const highlightY = canClickY && (jog.keypad || jog.axis === 'y');

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        Y: distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={classcat([styles.btnKeypad, {[styles.highlight]: highlightY}])}
        onClick={onJog}
        disabled={!canClickY}
        title={i18n._('Move Y+')}
        compact
      >
        <KeypadText>Y</KeypadText>
        <KeypadDirectionText>+</KeypadDirectionText>
      </Button>
    );
  }

  get buttonYMinus() {
    const {actions} = this.props;
    const {axes, canClick, jog} = this.props.state;

    const canClickY = canClick && axes.includes('y');
    const highlightY = canClickY && (jog.keypad || jog.axis === 'y');

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        Y: -distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={classcat([styles.btnKeypad, {[styles.highlight]: highlightY}])}
        onClick={onJog}
        disabled={!canClickY}
        title={i18n._('Move Y-')}
        compact
      >
        <KeypadText>Y</KeypadText>
        <KeypadDirectionText>-</KeypadDirectionText>
      </Button>
    );
  }

  get buttonZPlus() {
    const {actions} = this.props;
    const {axes, canClick, jog} = this.props.state;

    const canClickZ = canClick && axes.includes('z');
    const highlightZ = canClickZ && (jog.keypad || jog.axis === 'z');

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        Z: distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        className={classcat([styles.btnKeypad, {[styles.highlight]: highlightZ}])}
        onClick={onJog}
        disabled={!canClickZ}
        title={i18n._('Move Z+')}
        compact
      >
        <KeypadText>Z</KeypadText>
        <KeypadDirectionText>+</KeypadDirectionText>
      </Button>
    );
  }

  get buttonZMinus() {
    const {actions} = this.props;
    const {axes, canClick, jog} = this.props.state;

    const canClickZ = canClick && axes.includes('z');
    const highlightZ = canClickZ && (jog.keypad || jog.axis === 'z');

    const distance = actions.getJogDistance();
    const onJog = () => {
      actions.jog({
        Z: -distance,
      });
    };

    return (
      <Button
        btnStyle="flat"
        compact
        className={classcat([styles.btnKeypad, {[styles.highlight]: highlightZ}])}
        onClick={onJog}
        disabled={!canClickZ}
        title={i18n._('Move Z-')}
      >
        <KeypadText>Z</KeypadText>
        <KeypadDirectionText>-</KeypadDirectionText>
      </Button>
    );
  }

  get buttonZZero() {
    const {actions} = this.props;
    const {axes, canClick} = this.props.state;

    const canClickZ = canClick && axes.includes('z');

    const gotoZero = () =>
      actions.move({
        Z: 0,
      });

    return (
      <Button
        btnStyle="flat"
        className={styles.btnKeypad}
        onClick={gotoZero}
        disabled={!canClickZ}
        title={i18n._('Move To Z Zero (G0 Z0)')}
        compact
      >
        <KeypadText>Z</KeypadText>
        <KeypadSubscriptText>0</KeypadSubscriptText>
      </Button>
    );
  }

  get unitSelect() {
    const {canClick, units} = this.props.state;

    const select = (unit = 'metric') => {
      controller.command('gcode', unit === 'imperial' ? 'G20' : 'G21');
    };

    return (
      <Dropdown pullRight style={{width: '100%'}} disabled={!canClick}>
        <Dropdown.Toggle btnStyle="flat" style={{textAlign: 'right', width: '100%'}}>
          {units === IMPERIAL_UNITS && i18n._('G20 (inch)')}
          {units === METRIC_UNITS && i18n._('G21 (mm)')}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <MenuItem header>{i18n._('Units')}</MenuItem>
          <MenuItem active={units === IMPERIAL_UNITS} onSelect={select('imperial')}>
            {i18n._('G20 (inch)')}
          </MenuItem>
          <MenuItem active={units === METRIC_UNITS} onSelect={select('metric')}>
            {i18n._('G21 (mm)')}
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  get stepSize() {
    const {actions, state} = this.props;
    const {canClick, jog, units} = state;

    const imperialJogDistances = ensureArray(jog.imperial.distances);
    const metricJogDistances = ensureArray(jog.metric.distances);
    const imperialJogSteps = [...imperialJogDistances, ...IMPERIAL_STEPS];
    const metricJogSteps = [...metricJogDistances, ...METRIC_STEPS];
    const stepImperial = state.jog.imperial.step;
    const stepMetric = state.jog.metric.step;

    const onSelectStepSize = eventKey => actions.selectStep(eventKey);

    if (units === IMPERIAL_UNITS) {
      return (
        <Dropdown pullRight style={{width: '100%'}} disabled={!canClick} onSelect={onSelectStepSize}>
          <Dropdown.Toggle btnStyle="flat" style={{textAlign: 'right', width: '100%'}}>
            {imperialJogSteps[jog.imperial.step]}
            <Space width="4" />
            <sub>{i18n._('in')}</sub>
          </Dropdown.Toggle>
          <Dropdown.Menu style={{maxHeight: 150, overflowY: 'auto'}}>
            <MenuItem header>{i18n._('Imperial')}</MenuItem>
            {imperialJogSteps.map((value, key) => (
              <MenuItem key={value} eventKey={key} active={key === stepImperial}>
                {value}
                <Space width="4" />
                <sub>{i18n._('in')}</sub>
              </MenuItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      );
    }

    return (
      <Dropdown pullRight style={{width: '100%'}} disabled={!canClick} onSelect={onSelectStepSize}>
        <Dropdown.Toggle btnStyle="flat" style={{textAlign: 'right', width: '100%'}}>
          {metricJogSteps[jog.metric.step]}
          <Space width="4" />
          <sub>{i18n._('mm')}</sub>
        </Dropdown.Toggle>
        <Dropdown.Menu style={{maxHeight: 150, overflowY: 'auto'}}>
          <MenuItem header>{i18n._('Metric')}</MenuItem>
          {metricJogSteps.map((value, key) => (
            <MenuItem key={value} eventKey={key} active={key === stepMetric}>
              {value}
              <Space width="4" />
              <sub>{i18n._('mm')}</sub>
            </MenuItem>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  get buttonStepForward() {
    const {actions, state} = this.props;
    const {canClick, jog, units} = state;

    const imperialJogDistances = ensureArray(jog.imperial.distances);
    const metricJogDistances = ensureArray(jog.metric.distances);
    const imperialJogSteps = [...imperialJogDistances, ...IMPERIAL_STEPS];
    const metricJogSteps = [...metricJogDistances, ...METRIC_STEPS];

    const canStepForward =
      canClick &&
      ((units === IMPERIAL_UNITS && jog.imperial.step < imperialJogSteps.length - 1) ||
        (units === METRIC_UNITS && jog.metric.step < metricJogSteps.length - 1));

    return (
      <Repeatable
        disabled={!canStepForward}
        style={{marginLeft: 2.5}}
        repeatDelay={500}
        repeatInterval={Math.floor(1000 / 15)}
        onHold={actions.stepForward}
        onRelease={actions.stepForward}
      >
        <Button disabled={!canStepForward} style={{width: '100%'}} compact btnStyle="flat" className="pull-right">
          <i className="fa fa-plus" />
        </Button>
      </Repeatable>
    );
  }

  get buttonStepBackward() {
    const {actions, state} = this.props;
    const {canClick, jog, units} = state;

    const canStepBackward =
      canClick &&
      ((units === IMPERIAL_UNITS && jog.imperial.step > 0) || (units === METRIC_UNITS && jog.metric.step > 0));

    return (
      <Repeatable
        disabled={!canStepBackward}
        style={{marginRight: 2.5}}
        repeatDelay={500}
        repeatInterval={Math.floor(1000 / 15)}
        onHold={actions.stepBackward}
        onRelease={actions.stepBackward}
      >
        <Button disabled={!canStepBackward} style={{width: '100%'}} compact btnStyle="flat" className="pull-left">
          <i className="fa fa-minus" />
        </Button>
      </Repeatable>
    );
  }
}

export default Keypad;
