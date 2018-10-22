import ensureArray from 'ensure-array';
import React, {PureComponent} from 'react';
import {get} from 'lodash';
import {object} from 'prop-types';

import controller from '../../lib/controller';
// import i18n from '../../lib/i18n';

import Button from '../../components_new/Button';
import Fieldset from '../../components_new/Fieldset';
import Flexbox from '../../components_new/Flexbox';
import Padding from '../../components_new/Padding';
import Slider from 'rc-slider';
import SplitButton from '../../components_new/SplitButton';
import SpindleAnimation from './SpindleAnimation';

import s, {size as globalBaseUnit} from '../../styles/variables';

class Spindle extends PureComponent {
  static propTypes = {
    actions: object,
    state: object,
  };

  state = this.getDefaultState();

  getDefaultState() {
    return {
      coolant: 'off',
      spindle: 'off',
    };
  }

  render() {
    return (
      <Padding size="small">
        <Flexbox flexDirection="column" alignItems="center">
          {this.spindleAnimation}
          <Fieldset label={'Spindle'}>
            {this.spindleControl}
            {this.speedControl}
          </Fieldset>
          <Fieldset label={'Coolant'}>{this.coolantControl}</Fieldset>
        </Flexbox>
      </Padding>
    );
  }

  get spindleAnimation() {
    const spindle = {
      M3: 'right',
      M4: 'left',
      M5: 'off',
    };

    const coolant = {
      M7: 'mist',
      M8: 'flood',
      M9: 'off',
    };

    return (
      <Flexbox
        flexDirection="row"
        style={{
          height: `${globalBaseUnit * 12}px`,
          overflow: 'hidden',
          marginBottom: s.size.default,
        }}
      >
        <SpindleAnimation
          spindle={spindle[this.state.spindle]}
          coolant={coolant[this.state.coolant]}
          height={`${Math.floor(globalBaseUnit * 14.3)}px`}
        />
      </Flexbox>
    );
  }

  get speedControl() {
    const {actions} = this.props;
    // const {actions, state} = this.props;
    // const {spindleSpeed} = state;

    return (
      <Slider
        defaultValue={20000}
        // value={spindleSpeed}
        min={1000}
        max={35000}
        step={100}
        marks={{
          1000: '1000',
          2000: '2000',
        }}
        onChange={actions.handleSpindleSpeedChange}
      />
    );
  }

  get spindleControl() {
    const {state} = this.props;
    // const {canClick} = state;
    const canClick = true;

    const spindle = get(state, 'controller.modal.spindle');

    const spindleIsOn = spindle !== '' || this.state.spindle !== this.getDefaultState().spindle;

    return (
      <SplitButton equalWidth style={{width: '100%'}}>
        <Button
          text="Off"
          // text={i18n._('Off')}
          size="large"
          isDisabled={!spindleIsOn}
          onClick={this.turnOffSpindle}
        />
        <Button
          text="Right"
          // text={i18n._('Right')}
          size="large"
          isDisabled={!canClick || spindleIsOn}
          onClick={() => this.turnOnSpindle('right')}
        />
        <Button
          text="Left"
          // text={i18n._('Left')}
          size="large"
          isDisabled={!canClick || spindleIsOn}
          onClick={() => this.turnOnSpindle('left')}
        />
      </SplitButton>
    );
  }

  get coolantControl() {
    const {state} = this.props;
    // const {canClick} = state;
    const canClick = true;

    const coolant = ensureArray(get(state, 'controller.modal.coolant'));
    const mistCoolant = coolant.indexOf('M7') >= 0;
    const floodCoolant = coolant.indexOf('M8') >= 0;
    const coolantIsOn = mistCoolant || floodCoolant || this.state.coolant !== this.getDefaultState().coolant;

    return (
      <SplitButton equalWidth style={{width: '100%'}}>
        <Button
          text="Off"
          // text={i18n._('Off')}
          size="large"
          isDisabled={!coolantIsOn}
          onClick={this.turnOffCoolant}
        />
        <Button
          text="Mist"
          // text={i18n._('Mist')}
          size="large"
          isDisabled={!canClick || this.state.coolant === 'M7'}
          onClick={() => this.turnOnCoolant('mist')}
        />
        <Button
          text="Flood"
          // text={i18n._('Flood')}
          size="large"
          isDisabled={!canClick || this.state.coolant === 'M8'}
          onClick={() => this.turnOnCoolant('flood')}
        />
      </SplitButton>
    );
  }

  turnOnSpindle = direction => {
    const {spindleSpeed} = this.props.state;

    const command = direction === 'left' ? 'M4' : 'M3';

    if (spindleSpeed > 0) {
      controller.command('gcode', `${command} S${spindleSpeed}`);
    } else {
      controller.command('gcode', command);
    }

    this.setState({spindle: command});
  };

  turnOffSpindle = () => {
    controller.command('gcode', 'M5');

    this.setState({spindle: 'off'});
  };

  turnOnCoolant = type => {
    const command = {
      flood: 'M8',
      mist: 'M7',
    };

    if (!command[type]) {
      return;
    }

    controller.command('gcode', command[type]);

    this.setState({coolant: command[type]});
  };

  turnOffCoolant = () => {
    controller.command('gcode', 'M9');

    this.setState({coolant: 'off'});
  };
}

export default Spindle;
