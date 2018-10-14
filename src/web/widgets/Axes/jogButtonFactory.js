import classcat from 'classcat';
import React, {Fragment} from 'react';
import styled from 'styled-components';

import i18n from '../../lib/i18n';

import {Button} from '../../components/Buttons';

import styles from './index.styl';

const KeypadText = styled.span`
  display: inline-block;
  position: relative;
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

const getOnJogFunction = (props, axis1, axis2) => {
  const {getJogDistance, jog} = props.actions;

  const distance = getJogDistance();

  const jogMovement = {
    '+': distance,
    '-': -distance,
    '0': 0,
  };

  const jogObject = {
    [axis1.name.toUpperCase()]: jogMovement[axis1.direction],
  };

  if (axis2 !== undefined) {
    jogObject[axis2.name.toUpperCase()] = jogMovement[axis2.direction];
  }

  const onJog = () => {
    jog(jogObject);
  };

  return onJog;
};

const getJogButtonClasses = (props, axis1, axis2) => {
  const {axes, canClick, jog} = props.state;

  const classNames = [styles.btnKeypad];

  if (axis1.direction !== '0' && [axis1, axis2].filter(Boolean).length === 1) {
    let highlight;

    switch (axis1.name.toUpperCase()) {
      case 'X':
        highlight = canClick && axes.includes('x') && (jog.keypad || jog.axis === 'x');
        break;

      case 'Y':
        highlight = canClick && axes.includes('y') && (jog.keypad || jog.axis === 'y');
        break;

      case 'Z':
        highlight = canClick && axes.includes('z') && (jog.keypad || jog.axis === 'z');
        break;

      default:
        highlight = false;
    }

    classNames.push({[styles.highlight]: highlight});
  }

  return classcat(classNames);
};

const isDisabled = () => {
  // TODO
  return false;
};

const jogButtonFactory = (props, axis1 = {direction: '+', name: 'x'}, axis2) => {
  // const {state} = this.props;
  // const {axes, canClick, jog} = state;

  // const canClickX = canClick && axes.includes('x');
  // const canClickY = canClick && axes.includes('y');
  // const canClickZ = canClick && axes.includes('z');
  // const canClickXY = canClickX && canClickY;

  const givenArgs = [axis1, axis2].filter(Boolean);

  const classes = getJogButtonClasses(props, axis1, axis2);
  const onJog = getOnJogFunction(props, axis1, axis2);
  const disabled = isDisabled(givenArgs.map(a => a.name));
  const title = i18n._(`Move ${givenArgs.map(a => `${a.name.toUpperCase()}${a.direction}`).join(' ')}`);

  const renderButtonText = a => (
    <Fragment key={`${a.name}${a.direction}`}>
      <KeypadText>{a.name.toUpperCase()}</KeypadText>
      {a.direction === '0' ? (
        <KeypadSubscriptText>{a.direction}</KeypadSubscriptText>
      ) : (
        <KeypadDirectionText>{a.direction}</KeypadDirectionText>
      )}
    </Fragment>
  );

  return (
    <Button btnStyle="flat" className={classes} onClick={onJog} disabled={disabled} title={title} compact>
      {givenArgs.map(renderButtonText)}
    </Button>
  );
};

export default jogButtonFactory;
