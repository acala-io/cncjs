import PropTypes from 'prop-types';
import React from 'react';

import controller from '../../lib/controller';

import DigitalReadout from './DigitalReadout';
import RepeatButton from '../../components/RepeatButton';
import Space from '../../components/Space';

import './index.scss';

const Overrides = props => {
  const {ovF, ovS, ovR} = props;

  if (!ovF && !ovS && !ovR) {
    return null;
  }

  return (
    <div className="overrides">
      {Boolean(ovF) && (
        <DigitalReadout label="F" value={`${ovF}%`}>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:feed', -10);
            }}
          >
            <i className="fa fa-arrow-down" style={{fontSize: 14}} />
            <span style={{marginLeft: 5}}>-10%</span>
          </RepeatButton>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:feed', -1);
            }}
          >
            <i className="fa fa-arrow-down" style={{fontSize: 10}} />
            <span style={{marginLeft: 5}}>-1%</span>
          </RepeatButton>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:feed', 1);
            }}
          >
            <i className="fa fa-arrow-up" style={{fontSize: 10}} />
            <span style={{marginLeft: 5}}>1%</span>
          </RepeatButton>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:feed', 10);
            }}
          >
            <i className="fa fa-arrow-up" style={{fontSize: 14}} />
            <span style={{marginLeft: 5}}>10%</span>
          </RepeatButton>
          <button
            type="button"
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:feed', 0);
            }}
          >
            <i className="fa fa-undo fa-fw" />
          </button>
        </DigitalReadout>
      )}
      {Boolean(ovS) && (
        <DigitalReadout label="S" value={`${ovS}%`}>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:spindle', -10);
            }}
          >
            <i className="fa fa-arrow-down" style={{fontSize: 14}} />
            <span style={{marginLeft: 5}}>-10%</span>
          </RepeatButton>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:spindle', -1);
            }}
          >
            <i className="fa fa-arrow-down" style={{fontSize: 10}} />
            <span style={{marginLeft: 5}}>-1%</span>
          </RepeatButton>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:spindle', 1);
            }}
          >
            <i className="fa fa-arrow-up" style={{fontSize: 10}} />
            <span style={{marginLeft: 5}}>1%</span>
          </RepeatButton>
          <RepeatButton
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:spindle', 10);
            }}
          >
            <i className="fa fa-arrow-up" style={{fontSize: 14}} />
            <span style={{marginLeft: 5}}>10%</span>
          </RepeatButton>
          <button
            type="button"
            className="btn btn-default"
            style={{padding: 5}}
            onClick={() => {
              controller.command('override:spindle', 0);
            }}
          >
            <i className="fa fa-undo fa-fw" />
          </button>
        </DigitalReadout>
      )}
      {Boolean(ovR) && (
        <DigitalReadout label="R" value={`${ovR}%`}>
          <button
            type="button"
            className="btn btn-default"
            onClick={() => {
              controller.command('override:rapid', 100);
            }}
          >
            <i className="fa fa-battery-full" />
            <Space width="8" />
            100%
          </button>
          <button
            type="button"
            className="btn btn-default"
            onClick={() => {
              controller.command('override:rapid', 50);
            }}
          >
            <i className="fa fa-battery-half" />
            <Space width="8" />
            50%
          </button>
          <button
            type="button"
            className="btn btn-default"
            onClick={() => {
              controller.command('override:rapid', 25);
            }}
          >
            <i className="fa fa-battery-quarter" />
            <Space width="8" />
            25%
          </button>
        </DigitalReadout>
      )}
    </div>
  );
};

Overrides.propTypes = {
  ovF: PropTypes.number,
  ovS: PropTypes.number,
  ovR: PropTypes.number,
};

export default Overrides;
