import ensureArray from 'ensure-array';
import frac from 'frac';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import Repeatable from 'react-repeatable';

import controller from '../../lib/controller';

import ButtonGroup from '../../components_new/ButtonGroup';
import Fraction from './components/Fraction';
import jogButtonFactory from './jogButtonFactory';
import Space from '../../components/Space';
import {Button} from '../../components/Buttons';

import {IMPERIAL_UNITS, IMPERIAL_STEPS, METRIC_UNITS, METRIC_STEPS} from '../../constants';

import './index.scss';

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
      <div className="keypad">
        <div className="row no-gutters">
          <div>
            <div className="row-space">
              <div className="row no-gutters">
                <div className="col-xs-3">
                  <div className="col-space">
                    {jogButtonFactory(this.props, {direction: '-', name: 'x'}, {direction: '+', name: 'y'})}
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '+', name: 'y'})}</div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">
                    {jogButtonFactory(this.props, {direction: '+', name: 'x'}, {direction: '+', name: 'y'})}
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '+', name: 'z'})}</div>
                </div>
              </div>
            </div>
            <div className="row-space">
              <div className="row no-gutters">
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '-', name: 'x'})}</div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">
                    {jogButtonFactory(this.props, {direction: '0', name: 'x'}, {direction: '0', name: 'y'})}
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '+', name: 'x'})}</div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '0', name: 'z'})}</div>
                </div>
              </div>
            </div>
            <div className="row-space">
              <div className="row no-gutters">
                <div className="col-xs-3">
                  <div className="col-space">
                    {jogButtonFactory(this.props, {direction: '-', name: 'x'}, {direction: '-', name: 'y'})}
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '-', name: 'y'})}</div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">
                    {jogButtonFactory(this.props, {direction: '+', name: 'x'}, {direction: '-', name: 'y'})}
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="col-space">{jogButtonFactory(this.props, {direction: '-', name: 'z'})}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rowSpace u-margin-top">
            {this.stepSize}
            {this.unitSelect}
          </div>
          <div className="row-space">
            <div className="row no-gutters">
              <div className="col-xs-6">{this.buttonStepBackward}</div>
              <div className="col-xs-6">{this.buttonStepForward}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  get unitSelect() {
    const {canClick, units} = this.props.state;

    const select = (unit = METRIC_UNITS) => {
      controller.command('gcode', unit === IMPERIAL_UNITS ? 'G20' : 'G21');
    };

    return (
      <ButtonGroup
        optionName="units"
        options={[METRIC_UNITS, IMPERIAL_UNITS]}
        selectedValue={units}
        onChange={select}
        isDisabled={!canClick}
      />
    );
  }

  get stepSize() {
    const {actions, state} = this.props;
    const {jog, units} = state; // canClick,

    const imperialJogDistances = ensureArray(jog.imperial.distances);
    const metricJogDistances = ensureArray(jog.metric.distances);
    const imperialJogSteps = [...imperialJogDistances, ...IMPERIAL_STEPS];
    const metricJogSteps = [...metricJogDistances, ...METRIC_STEPS];

    const isImperial = units === IMPERIAL_UNITS;

    const onSelectStepSize = e => actions.selectStep(e);

    return (
      <ButtonGroup
        optionName="step-size"
        options={isImperial ? imperialJogSteps : metricJogSteps}
        selectedValue={isImperial ? jog.imperial.step : jog.metric.step}
        onChange={onSelectStepSize}
        // isDisabled={!canClick}
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
