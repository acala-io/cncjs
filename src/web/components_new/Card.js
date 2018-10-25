/*
 * Card component.
 *
 * Usage:
 * <Card>
 *   Some content
 * </Card>
 *
 * <Card className="background--flamboyant" noPad>
 *   <CardHeader heading="Heading of the card"/>
 *   Some content
 * </Card>
 */

import React from 'react';
import styled from 'styled-components';
import {arrayOf, bool, node, object, oneOfType, string} from 'prop-types';

export const Card = styled.div`
  /*
   * 1 - Allow absolute positioning of children
   */

  background: ${({theme}) => theme.color.background.white};
  border-radius: ${({theme}) => theme.border.radius.large};
  position: relative; /* 1 */

  ${({shadow, theme}) =>
    shadow
      ? `box-shadow: ${theme.boxShadow.default};`
      : `border: ${theme.border.width.default} solid ${theme.color.border.lighter};`}

  ${({noPad}) => (noPad ? '' : `padding: ${({theme}) => theme.border.width.default};`)}

  ${({fitToPage, theme}) =>
    fitToPage
      ? `
        /*
         * 1 - Fallback value for calculated min-height using vh
         * 2 - 100% - some margin at top and bottom
         */

        min-height: 772px; /* 1 */
        min-height: calc(100vh - ${theme.size.large}); /* 2 */
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
  color: ${({theme}) => theme.color.text.lighter};
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

  padding: ${({theme}) => theme.size.small} ${({theme}) => theme.size.default};
  position: relative; /* 1 */

  h3 {
    color: ${({theme}) => theme.color.text.lighter};
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
