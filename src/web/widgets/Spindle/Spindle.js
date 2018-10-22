import ensureArray from 'ensure-array';
import {arrayOf, node, object, oneOf, string} from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import styled from 'styled-components';
import {get} from 'lodash';

import controller from '../../lib/controller';
// import i18n from '../../lib/i18n';

import Button from '../../components_new/Button';
import Flexbox from '../../components_new/Flexbox';
import NumberInput from '../../components_new/NumberInput';
import SplitButton from '../../components_new/SplitButton';
import SpindleAnimation from './SpindleAnimation';

import s, {size as globalBaseUnit} from '../../styles/variables';

const StyledLabel = styled.label`
  font-weight: ${s.font.weight.normal};
  padding-right: ${s.size.default};
`;

// TODO: this is a layout pattern that should be abstracted
const ControlSection = ({children, label}) => (
  <Flexbox
    flexDirection="row"
    justifyContent="center"
    alignItems="center"
    style={{
      paddingBottom: s.size.default,
      width: '100%',
    }}
  >
    <StyledLabel>{label}</StyledLabel>
    {children}
  </Flexbox>
);

ControlSection.propTypes = {
  children: oneOf([node, arrayOf(node)]),
  label: string,
};

const SpeedControl = styled.div`
  padding-bottom: ${s.size.default};
`;

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
      <Fragment>
        <Flexbox flexDirection="column" alignItems="center">
          {this.spindleSpeed}
          {this.spindleAnimation}
          {this.spindleControl}
          {this.coolantControl}
        </Flexbox>
      </Fragment>
    );
  }

  get spindleSpeed() {
    const {actions, state} = this.props;
    const {spindleSpeed} = state;

    return (
      <SpeedControl>
        <NumberInput
          value={spindleSpeed}
          defaultValue={0}
          digits={0}
          placeholder="0"
          onChange={actions.handleSpindleSpeedChange}
          large
        />
        RPM
      </SpeedControl>
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
          height: `${globalBaseUnit * 11}px`,
          overflow: 'hidden',
          paddingBottom: s.size.default,
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

  get spindleControl() {
    const {state} = this.props;
    // const {canClick} = state;
    const canClick = true;

    const spindle = get(state, 'controller.modal.spindle');

    const spindleIsOn = spindle !== '';

    return (
      <ControlSection label="Spindle">
        <SplitButton>
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
      </ControlSection>
    );
  }

  get coolantControl() {
    const {state} = this.props;
    // const {canClick} = state;
    const canClick = true;

    const coolant = ensureArray(get(state, 'controller.modal.coolant'));
    const mistCoolant = coolant.indexOf('M7') >= 0;
    const floodCoolant = coolant.indexOf('M8') >= 0;
    const coolantIsOn = mistCoolant || floodCoolant;

    return (
      <ControlSection label="Coolant">
        <SplitButton>
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
            isDisabled={!canClick || mistCoolant}
            onClick={() => this.turnOnCoolant('mist')}
          />
          <Button
            text="Flood"
            // text={i18n._('Flood')}
            size="large"
            isDisabled={!canClick || floodCoolant}
            onClick={() => this.turnOnCoolant('flood')}
          />
        </SplitButton>
      </ControlSection>
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

    this.setState({spindle: 'M5'});
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

    this.setState({coolant: 'M9'});
  };
}

export default Spindle;
