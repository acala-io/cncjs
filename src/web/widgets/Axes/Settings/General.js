import ensureArray from 'ensure-array';
import ForEach from 'react-foreach';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import {includes, set, uniqueId} from 'lodash';

import i18n from '../../../lib/i18n';

import ActionLink from '../../../components_new/ActionLink';
import Button from '../../../components_new/Button';
import Margin from '../../../components/Margin';
import Space from '../../../components/Space';
import {Checkbox} from '../../../components/Checkbox';
import {FlexContainer, Row, Col} from '../../../components/GridSystem';
import {FormGroup, Input} from '../../../components/Forms';

const IMPERIAL_JOG_DISTANCES_MAX = 5;
const METRIC_JOG_DISTANCES_MAX = 5;

class General extends PureComponent {
  static propTypes = {
    axes: PropTypes.array.isRequired,
    imperialJogDistances: PropTypes.array.isRequired,
    metricJogDistances: PropTypes.array.isRequired,
  };

  field = {
    axisA: null,
    axisB: null,
    axisC: null,
    axisX: null,
    axisY: null,
    axisZ: null,
  };

  state = {
    imperialJogDistances: ensureArray(this.props.imperialJogDistances),
    metricJogDistances: ensureArray(this.props.metricJogDistances),
  };

  withFieldRef = key => node => {
    set(this.field, key, node);
  };

  addMetricJogDistance = () => () => {
    this.setState(state => ({
      metricJogDistances: state.metricJogDistances.concat(''),
    }));
  };

  changeMetricJogDistance = targetIndex => event => {
    const targetValue = event.target.value;

    this.setState(state => ({
      metricJogDistances: state.metricJogDistances.map((value, index) => {
        if (index === targetIndex) {
          return targetValue;
        }

        return value;
      }),
    }));
  };

  removeMetricJogDistance = index => () => {
    this.setState(state => {
      const metricJogDistances = [...state.metricJogDistances];
      // Remove the array element at the index
      metricJogDistances.splice(index, 1);

      return {
        metricJogDistances,
      };
    });
  };

  addImperialJogDistance = () => () => {
    this.setState(state => ({
      imperialJogDistances: state.imperialJogDistances.concat(''),
    }));
  };

  changeImperialJogDistance = targetIndex => event => {
    const targetValue = event.target.value;

    this.setState(state => ({
      imperialJogDistances: state.imperialJogDistances.map((value, index) => {
        if (index === targetIndex) {
          return targetValue;
        }

        return value;
      }),
    }));
  };

  removeImperialJogDistance = index => () => {
    this.setState(state => {
      const imperialJogDistances = [...state.imperialJogDistances];
      // Remove the array element at the index
      imperialJogDistances.splice(index, 1);

      return {
        imperialJogDistances,
      };
    });
  };

  render() {
    return (
      <FlexContainer gutterWidth={0}>
        <Margin bottom={15}>{this.axesSettings}</Margin>
        <Margin bottom={15}>{this.jogDistanceSettings}</Margin>
      </FlexContainer>
    );
  }

  get axesSettings() {
    const {axes} = this.props;

    return (
      <Fragment>
        <label>
          <strong>{i18n._('Axes')}</strong>
        </label>
        <Row>
          <Col xs={4}>
            <FormGroup>
              <Checkbox ref={this.withFieldRef('axisX')} checked disabled>
                <Space width="8" />
                {i18n._('X-axis')}
              </Checkbox>
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <Checkbox ref={this.withFieldRef('axisY')} defaultChecked={includes(axes, 'y')}>
                <Space width="8" />
                {i18n._('Y-axis')}
              </Checkbox>
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <Checkbox ref={this.withFieldRef('axisZ')} defaultChecked={includes(axes, 'z')}>
                <Space width="8" />
                {i18n._('Z-axis')}
              </Checkbox>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <FormGroup>
              <Checkbox ref={this.withFieldRef('axisA')} defaultChecked={includes(axes, 'a')}>
                <Space width="8" />
                {i18n._('A-axis')}
              </Checkbox>
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <Checkbox ref={this.withFieldRef('axisB')} defaultChecked={includes(axes, 'b')}>
                <Space width="8" />
                {i18n._('B-axis')}
              </Checkbox>
            </FormGroup>
          </Col>
          <Col xs={4}>
            <FormGroup>
              <Checkbox ref={this.withFieldRef('axisC')} defaultChecked={includes(axes, 'c')}>
                <Space width="8" />
                {i18n._('C-axis')}
              </Checkbox>
            </FormGroup>
          </Col>
        </Row>
      </Fragment>
    );
  }

  get jogDistanceSettings() {
    return (
      <Row>
        {this.metricJogDistanceSettings}
        <Col width="auto">
          <Space width="24" />
        </Col>
        {this.imperialJogDistanceSettings}
      </Row>
    );
  }

  // eslint-disable-next-line max-params
  renderJogDistanceSettings(items, maxItems, onAdd, onChange, onRemove, units) {
    return (
      <Col>
        <label>
          <strong>{i18n._(`Custom Jog Distance (${units})`)}</strong>
        </label>
        <ForEach items={items}>
          {(value, i) => (
            <FormGroup key={uniqueId()}>
              <Row>
                <Col>
                  <Input type="number" className="number" onChange={() => onChange(i)} defaultValue={value} />
                </Col>
                <Col>
                  <ActionLink action="delete" onClick={() => onRemove(i)} />
                </Col>
              </Row>
            </FormGroup>
          )}
        </ForEach>
        {items.length < maxItems && <Button text={i18n._('Add a value')} onClick={onAdd} />}
      </Col>
    );
  }

  get metricJogDistanceSettings() {
    return this.renderJogDistanceSettings(
      this.state.metricJogDistances,
      METRIC_JOG_DISTANCES_MAX,
      this.addMetricJogDistance,
      this.changeMetricJogDistance,
      this.removeMetricJogDistance,
      'mm'
    );
  }

  get imperialJogDistanceSettings() {
    return this.renderJogDistanceSettings(
      this.state.imperialJogDistances,
      IMPERIAL_JOG_DISTANCES_MAX,
      this.addImperialJogDistance,
      this.changeImperialJogDistance,
      this.removeImperialJogDistance,
      'inches'
    );
  }

  get value() {
    // Axes
    const axes = [];
    axes.push('x');

    if (this.field.axisY.checked) {
      axes.push('y');
    }
    if (this.field.axisZ.checked) {
      axes.push('z');
    }
    if (this.field.axisA.checked) {
      axes.push('a');
    }
    if (this.field.axisB.checked) {
      axes.push('b');
    }
    if (this.field.axisC.checked) {
      axes.push('c');
    }

    // Imperial Jog Distance
    const imperialJogDistances = [];
    for (let i = 0; i < this.state.imperialJogDistances.length; ++i) {
      const value = Number(this.state.imperialJogDistances[i]);
      if (value > 0) {
        imperialJogDistances.push(value);
      }
    }

    // Metric Jog Distance
    const metricJogDistances = [];
    for (let i = 0; i < this.state.metricJogDistances.length; ++i) {
      const value = Number(this.state.metricJogDistances[i]);
      if (value > 0) {
        metricJogDistances.push(value);
      }
    }

    return {
      axes,
      imperialJogDistances,
      metricJogDistances,
    };
  }
}

export default General;
