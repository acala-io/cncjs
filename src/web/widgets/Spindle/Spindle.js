import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {get} from 'lodash';

import controller from '../../lib/controller';

import Button from '../../components_new/Button';
import Flexbox from '../../components_new/Flexbox';
import Padding from '../../components_new/Padding';
import SplitButton from '../../components_new/SplitButton';

import './index.scss';

class Spindle extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    return (
      <Flexbox flexDirection="column">
        <Flexbox flexDirection="row" alignItems="center">
          {this.spindleSpeed}
          {this.spindleControl}
        </Flexbox>
        {this.coolantControl}
      </Flexbox>
    );
  }

  get spindleSpeed() {
    const {actions, state} = this.props;
    const {spindleSpeed} = state;

    return (
      <Padding sides="right" size="small">
        <div className="input-group">
          <input
            type="number"
            className="form-control number"
            value={spindleSpeed}
            placeholder="0"
            min={0}
            step={1}
            onChange={actions.handleSpindleSpeedChange}
          />
          <span className="input-group-addon">RPM</span>
        </div>
      </Padding>
    );
  }

  get spindleControl() {
    const {state} = this.props;
    const {canClick, spindleSpeed} = state;

    const spindle = get(state, 'controller.modal.spindle');

    const spindleIsOn = spindle !== '';

    const turnOnSpindle = direction => {
      const command = direction === 'left' ? 'M4' : 'M3';

      if (spindleSpeed > 0) {
        controller.command('gcode', `${command} S${spindleSpeed}`);
      } else {
        controller.command('gcode', command);
      }
    };
    const turnOffSpindle = () => controller.command('gcode', 'M5');

    return (
      <SplitButton>
        <Button text="Off" icon="on-off" isDisabled={!spindleIsOn} handleClick={turnOffSpindle} />
        <Button text="Right" isDisabled={!canClick || spindleIsOn} handleClick={() => turnOnSpindle('right')} />
        <Button text="Left" isDisabled={!canClick || spindleIsOn} handleClick={() => turnOnSpindle('left')} />
      </SplitButton>
    );
  }

  get coolantControl() {
    const {state} = this.props;
    const {canClick} = state;

    const coolant = ensureArray(get(state, 'controller.modal.coolant'));
    const mistCoolant = coolant.indexOf('M7') >= 0;
    const floodCoolant = coolant.indexOf('M8') >= 0;
    const coolantIsOn = mistCoolant || floodCoolant;

    const turnOnCoolant = type => {
      const command = {
        flood: 'M8',
        mist: 'M7',
      };

      if (!command[type]) {
        return;
      }

      controller.command('gcode', command);
    };
    const turnOffCoolant = () => controller.command('gcode', 'M9');

    return (
      <SplitButton>
        <Button text="Off" icon="on-off" isDisabled={!coolantIsOn} handleClick={turnOffCoolant} />
        <Button text="Mist" isDisabled={!canClick || mistCoolant} handleClick={() => turnOnCoolant('mist')} />
        <Button text="Flood" isDisabled={!canClick || floodCoolant} handleClick={() => turnOnCoolant('flood')} />
      </SplitButton>
    );

    // <div>
    //   <label className="control-label">{i18n._('Coolant')}</label>
    //   <div className="btn-group btn-group-justified" role="group">
    //     <div className="btn-group btn-group-sm" role="group">
    //       <button
    //         type="button"
    //         className="btn btn-default"
    //         style={{padding: '5px 0'}}
    //         onClick={() => {
    //           controller.command('gcode', 'M7');
    //         }}
    //         title={i18n._('Mist Coolant On (M7)', {ns: 'gcode'})}
    //         disabled={!canClick}
    //       >
    //         <i className={classcat(['icon', 'icon-fan', {'fa-spin': mistCoolant}])} />
    //         M7
    //       </button>
    //     </div>
    //     <div className="btn-group btn-group-sm" role="group">
    //       <button
    //         type="button"
    //         className="btn btn-default"
    //         style={{padding: '5px 0'}}
    //         onClick={() => {
    //           controller.command('gcode', 'M8');
    //         }}
    //         title={i18n._('Flood Coolant On (M8)', {ns: 'gcode'})}
    //         disabled={!canClick}
    //       >
    //         <i className={classcat(['icon', 'icon-fan', {'fa-spin': floodCoolant}])} />
    //         M8
    //       </button>
    //     </div>
    //     <div className="btn-group btn-group-sm" role="group">
    //       <button
    //         type="button"
    //         className="btn btn-default"
    //         style={{padding: '5px 0'}}
    //         onClick={() => {
    //           controller.command('gcode', 'M9');
    //         }}
    //         title={i18n._('Coolant Off (M9)', {ns: 'gcode'})}
    //         disabled={!canClick}
    //       >
    //         <i className="fa fa-power-off" />
    //         M9
    //       </button>
    //     </div>
    //   </div>
    // </div>
  }
}

export default Spindle;
