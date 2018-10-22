import ensureArray from 'ensure-array';
import frac from 'frac';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import Repeatable from 'react-repeatable';

import controller from '../../lib/controller';

import Button from '../../components_new/Button';
import ButtonGroup from '../../components_new/ButtonGroup';
import Flexbox from '../../components_new/Flexbox';
import Fraction from './components/Fraction';
import KeypadXY from './components/KeypadXY';
import KeypadZ from './components/KeypadZ';
import Padding from '../../components_new/Padding';
import Space from '../../components/Space';
// import SplitButton from '../../components_new/SplitButton';

import {IMPERIAL_UNITS, IMPERIAL_STEPS, METRIC_UNITS, METRIC_STEPS} from '../../constants';

class Keypad extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  sendGCode = gCode => controller.command('gcode', gCode);

  handleSelect = eventKey => {
    const commands = ensureArray(eventKey);
    commands.forEach(command => this.sendGCode(command));
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
      <Fragment>
        <Padding sides="top">
          <Flexbox flexDirection="row" alignItems="center" justifyContent="space-around">
            <KeypadXY {...this.props} />
            <KeypadZ {...this.props} />
          </Flexbox>
        </Padding>
        <Padding size="small">
          <Padding size="small" sides="bottom">
            {this.stepSize}
          </Padding>
          {/*
              I don't know what these buttons are for
              <SplitButton>
                {this.buttonStepBackward}
                {this.buttonStepForward}
              </SplitButton>
          */}
          {this.unitSelect}
        </Padding>
      </Fragment>
    );
  }

  get unitSelect() {
    const {canClick, units} = this.props.state;

    const select = (unit = METRIC_UNITS) => {
      this.sendGCode(unit === IMPERIAL_UNITS ? 'G20' : 'G21');
    };

    return (
      <ButtonGroup
        optionName="units"
        options={[METRIC_UNITS, IMPERIAL_UNITS]}
        selectedValue={units}
        onChange={select}
        isDisabled={!canClick}
        equalWidth
      />
    );
  }

  get stepSize() {
    const {actions, state} = this.props;
    const {canClick, jog, units} = state;

    const imperialJogDistances = ensureArray(jog.imperial.distances);
    const metricJogDistances = ensureArray(jog.metric.distances);
    const imperialJogSteps = [...imperialJogDistances, ...IMPERIAL_STEPS];
    const metricJogSteps = [...metricJogDistances, ...METRIC_STEPS];

    const isImperial = units === IMPERIAL_UNITS;

    const onSelectStepSize = e => actions.selectStep(e);

    return (
      <ButtonGroup
        optionName="step-size"
        className="center--mx"
        options={(isImperial ? imperialJogSteps : metricJogSteps).map(s => ({label: s, unit: units, value: s}))}
        selectedValue={isImperial ? jog.imperial.step : jog.metric.step}
        onChange={onSelectStepSize}
        isDisabled={!canClick}
        equalWidth
      />
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
        repeatDelay={500}
        repeatInterval={Math.floor(1000 / 15)}
        onHold={actions.stepForward}
        onRelease={actions.stepForward}
      >
        <Button text="+" isDisabled={!canStepForward} />
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
        repeatDelay={500}
        repeatInterval={Math.floor(1000 / 15)}
        onHold={actions.stepBackward}
        onRelease={actions.stepBackward}
      >
        <Button text="-" isDisabled={!canStepBackward} />
      </Repeatable>
    );
  }
}

export default Keypad;
