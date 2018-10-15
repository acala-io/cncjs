/*
 * Card component.
 *
 * Usage:
 * <Card>
 *   Some content
 * </Card>
 *
 * <Card noPad className="background--flamboyant">
 *   <CardHeader heading="Heading of the card"/>
 *   Some content
 * </Card>
 */

import classcat from 'classcat';
import React from 'react';
import {bool, node, string} from 'prop-types';

export const Card = ({children, className = '', fitToPage = false, noPad = false, shadow = false}) => {
  const classes = classcat([
    'card',
    {
      'card--fit-to-vh': fitToPage,
      'card--no-padding': noPad,
      'card--shadow': shadow,
    },
    className,
  ]);

  return <div className={classes}>{children}</div>;
};

Card.propTypes = {
  children: node,
  className: string,
  fitToPage: bool,
  noPad: bool,
  shadow: bool,
};

const Heading = ({heading}) => <h2>{heading}</h2>;

Heading.propTypes = {
  heading: string,
};

export const CardHeader = ({heading, children, className, removeCardPadding = false}) => (
  <div className={classcat(['card__header', {'card__header--wo-card-padding': removeCardPadding}, className])}>
    {heading ? <Heading heading={heading} /> : null}
    {children}
  </div>
);

CardHeader.propTypes = {
  children: node,
  className: string,
  heading: string,
  removeCardPadding: bool,
};

export default Card;
