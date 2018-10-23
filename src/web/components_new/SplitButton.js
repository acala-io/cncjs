/*
 * Split Button component for wrapping multiple buttons.
 *
 * Usage:
 * <SplitButton className="">
 *   <Button text="Save" size="large" isDisabled={!this.isValid} onClick={() => { alert('hi'); }}/>
 *   <Button text="Save" width="full-width" isInProgress={this.isLoading} onClick={() => { alert('hi'); }}/>
 * </SplitButton>
 */

import styled from 'styled-components';

const SplitButton = styled.div`
  display: ${({equalWidth}) => (equalWidth ? 'flex' : 'table')};

  /*
   * 1 - Remove border-radius from inner buttons
   * 2 - Keep outer border-radius on left- and rightmost buttons
   */

  button,
  .button {
    border-radius: 0; /* 1 */
    ${({equalWidth}) => (equalWidth ? 'flex: 1' : '')};

    :first-child {
      border-bottom-left-radius: ${({theme}) => theme.border.radius.large}; /* 2 */
      border-top-left-radius: ${({theme}) => theme.border.radius.large}; /* 2 */
    }

    :last-child {
      border-bottom-right-radius: ${({theme}) => theme.border.radius.large}; /* 2 */
      border-top-right-radius: ${({theme}) => theme.border.radius.large}; /* 2 */
    }
  }
`;

export default SplitButton;
