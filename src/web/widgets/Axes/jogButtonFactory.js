import classcat from 'classcat';
import React from 'react';

import i18n from '../../lib/i18n';

import Tooltip from '../../components/Tooltip';

const getOnJogFunction = (props, axis1, axis2) => {
  const {getJogDistance, jog} = props.actions;

  const distance = getJogDistance();

  const jogMovement = {
    '+': distance,
    '-': -distance,
    0: 0,
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

  const classNames = ['keypad-button'];

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

    classNames.push({highlight});
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

  // const renderButtonText = a => <Fragment key={a.direction}>{`${a.name.toUpperCase()}${a.direction}`}</Fragment>;

  if (disabled) {
    return null;
  }

  // return <div className={classes} onClick={onJog} />;

  return (
    <Tooltip placement="top" content={title} hideOnClick>
      <div className={classes} onClick={onJog} />
    </Tooltip>
  );
};

export default jogButtonFactory;
