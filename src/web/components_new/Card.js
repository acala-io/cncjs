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

import React from 'react';
import styled from 'styled-components';
import {arrayOf, bool, node, object, oneOfType, string} from 'prop-types';

import s from '../styles/theme';

export const Card = styled.div`
 /*
  * 1 - Allow absolute positioning of children
  */

  background: ${s.color.background.white};
  border-radius: ${s.border.radius.large};
  position: relative; /* 1 */

  ${({shadow}) =>
    shadow
      ? 'box-shadow: 1px 1px 3px 1px hsla(0, 0%, 0%, 0.21);'
      : `border: ${s.border.width.default} solid ${s.color.border.lighter};`}

  ${({noPad}) => (noPad ? '' : `padding: ${s.border.width.default};`)}

  ${({fitToPage}) =>
    fitToPage
      ? `
        /*
         * 1 - Fallback value for calculated min-height using vh
         * 2 - 100% - some margin at top and bottom
         */

        min-height: 772px; /* 1 */
        min-height: calc(100vh - ${s.size.large}); /* 2 */
        `
      : ''}
`;

Card.propTypes = {
  children: oneOfType([arrayOf(node), node]).isRequired,
  className: string,
  fitToPage: bool,
  noPad: bool,
  shadow: bool,
  style: object,
};

const Heading = styled.h3`
  color: ${s.color.text.lighter};
  line-height: 1.5;
  margin: 0;
`;

Heading.propTypes = {
  heading: string,
};

const StyledCardHeader = styled.div`
  /*
   * 1 - Enabled absolute positioning of children
   */

  padding: ${s.size.small} ${s.size.default};
  position: relative; /* 1 */

  h3 {
    color: ${s.color.text.lighter};
    line-height: 1.5;
    margin: 0;
  }
`;

export const CardHeader = ({children, className, heading}) => (
  <StyledCardHeader className={className}>
    {heading ? <Heading>{heading}</Heading> : null}
    {children}
  </StyledCardHeader>
);

CardHeader.propTypes = {
  children: oneOfType([arrayOf(node), node]).isRequired,
  className: string,
  heading: string,
};

export default Card;
