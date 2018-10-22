import ensureArray from 'ensure-array';
import {arrayOf, node, object, oneOf, string} from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import styled from 'styled-components';
import {get} from 'lodash';

import controller from '../../lib/controller';
// import i18n from '../../lib/i18n';

import Button from '../../components_new/Button';
import Flexbox from '../../components_new/Flexbox';
import Slider from 'rc-slider';
import SplitButton from '../../components_new/SplitButton';
import SpindleAnimation from './SpindleAnimation';

import s, {size as globalBaseUnit} from '../../styles/variables';

const StyledLabel = styled.label`
  color: ${s.color.text.lighter};
  font-weight: ${s.font.weight.normal};
  width: 5em;
`;

const StyledControlSection = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  padding-bottom: ${s.size.small};
  padding-left: ${s.size.small};
  padding-right: ${s.size.small};
  width: 100%;

  & + & {
    padding-top: ${s.size.large};
  }
`;

// TODO: this is a layout pattern that should be abstracted
const ControlSection = ({children, label}) => (
  <StyledControlSection flexDirection="row" justifyContent="flex-start" alignItems="center">
    <StyledLabel>{label}</StyledLabel>
    {children}
  </StyledControlSection>
);

ControlSection.propTypes = {
  children: oneOf([node, arrayOf(node)]),
  label: string,
};

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
          {this.spindleAnimation}
          {this.spindleControl}
          {this.speedControl}
          {this.coolantControl}
        </Flexbox>
      </Fragment>
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

  get speedControl() {
    const {actions} = this.props;
    // const {actions, state} = this.props;
    // const {spindleSpeed} = state;

    return (
      <ControlSection label="">
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
      </ControlSection>
    );
  }

  get spindleControl() {
    const {state} = this.props;
    // const {canClick} = state;
    const canClick = true;

    const spindle = get(state, 'controller.modal.spindle');

    const spindleIsOn = spindle !== '' || this.state.spindle !== this.getDefaultState().spindle;

    return (
      <ControlSection label="Spindle">
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
    const coolantIsOn = mistCoolant || floodCoolant || this.state.coolant !== this.getDefaultState().coolant;

    return (
      <ControlSection label="Coolant">
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
