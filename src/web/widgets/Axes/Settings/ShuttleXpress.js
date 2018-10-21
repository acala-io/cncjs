import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import Slider from 'rc-slider';

import i18n from '../../../lib/i18n';

import Flexbox from '../../../components_new/Flexbox';
import Select from '../../../components_new/Select';
import SettingsRow from '../../../settings/SettingsRow';

const FEEDRATE_RANGE = [100, 2500];
const FEEDRATE_STEP = 50;
const OVERSHOOT_RANGE = [1, 1.5];
const OVERSHOOT_STEP = 0.1;

class ShuttleXpress extends PureComponent {
  static propTypes = {
    feedrateMax: PropTypes.number,
    feedrateMin: PropTypes.number,
    hertz: PropTypes.number,
    overshoot: PropTypes.number,
  };

  state = this.getInitialState();

  onChangeFeedrateSlider = value => {
    const [min, max] = value;

    this.setState({
      feedrateMax: max,
      feedrateMin: min,
    });
  };

  onChangeHertz = e => {
    this.setState({
      hertz: Number(e.target.value),
    });
  };

  onChangeOvershootSlider = value => {
    const overshoot = value;

    this.setState({
      overshoot,
    });
  };

  getInitialState() {
    const {feedrateMax, feedrateMin, hertz, overshoot} = this.props;

    return {feedrateMax, feedrateMin, hertz, overshoot};
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {feedrateMax, feedrateMin, hertz, overshoot} = nextProps;

    this.setState({
      feedrateMax,
      feedrateMin,
      hertz,
      overshoot,
    });
  }

  render() {
    const {feedrateMax, feedrateMin, hertz, overshoot} = this.state;

    const repeatRateOptions = [60, 45, 30, 15, 10, 5, 2, 1];

    return (
      <Flexbox flexDirection="column">
        <SettingsRow
          input={
            <Slider.Range
              allowCross={false}
              defaultValue={[feedrateMin, feedrateMax]}
              min={FEEDRATE_RANGE[0]}
              max={FEEDRATE_RANGE[1]}
              step={FEEDRATE_STEP}
              onChange={this.onChangeFeedrateSlider}
            />
          }
          label={i18n._('Feed Rate Range')}
          value={
            <Fragment>
              {feedrateMin} - {feedrateMax}
              <span className="unit">mm/min</span>
            </Fragment>
          }
        />
        <SettingsRow
          input={
            <Select
              options={repeatRateOptions}
              selectedOption={hertz}
              optionFormatter={v => i18n._(`${v !== 1 ? v : 'Once'} ${v !== 1 ? 'Times' : ''} per Second`)}
              onChange={this.onChangeHertz}
            />
          }
          label={i18n._('Repeat Rate')}
          value={
            <Fragment>
              {hertz}
              <span className="unit">Hz</span>
            </Fragment>
          }
        />
        <SettingsRow
          input={
            <Slider
              defaultValue={overshoot}
              min={OVERSHOOT_RANGE[0]}
              max={OVERSHOOT_RANGE[1]}
              step={OVERSHOOT_STEP}
              onChange={this.onChangeOvershootSlider}
            />
          }
          label={i18n._('Distance Overshoot')}
          value={
            <Fragment>
              {overshoot}
              <span className="unit">×</span>
            </Fragment>
          }
        />
      </Flexbox>
    );
  }
}

export default ShuttleXpress;
