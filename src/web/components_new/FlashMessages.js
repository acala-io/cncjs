/*
 * Flash Message component.
 * Renders variants (success, error, info).
 * Can also render buttons and undo links.
 *
 * Render with button:
 *
 * dispatch(
 *   flashMessage(
 *     'Flash message text here',
 *     {
 *       actions: {
 *         button: {
 *           onClick: () => {
 *             alert('Clicked');
 *           },
 *           text: 'Button text here',
 *         },
 *       },
 *     }
 *   )
 * )
 *
 * Render with undo link:
 *
 * dispatch(
 *   flashMessage(
 *     'Flash message text',
 *     {
 *       actions: {
 *         undo: {
 *           onClick: () => {
 *             alert('Clicked');
 *           },
 *           text: 'Undo',
 *         }
 *       },
 *     }
 *   )
 * )
 */

import React from 'react';
import styled from 'styled-components';
import {arrayOf, number, object, oneOf, shape, string} from 'prop-types';
import {connect} from 'react-redux';
import {transparentize} from '../lib/color';

import {getFlashMessages} from '../reducers/flash';

import Button from './Button';
import {Link} from './Link';

import animation from '../styles/animations/';
import helper from '../styles/helpers/';

const FlashMessagesContainer = styled.div`
  position: fixed;
  right: ${({theme}) => theme.size.small};
  top: ${({theme}) => theme.size.small};
  z-index: ${({theme}) => theme.zIndex.topMost1};
`;

const FlashMessage = styled.div`
  ${animation.slideLeftIn};
  ${helper.spaceBetweenSelf('small')}

  background: ${({theme}) => transparentize(theme.color.background.lighter, 0.03)};
  border-radius: ${({theme}) => theme.border.radius.default};
  box-shadow: ${({theme}) => theme.boxShadow.default};
  color: ${({theme}) => theme.color.text.default};
  padding: ${({theme}) => theme.size.small};
  width: 20em;
`;

const FlashMessageError = styled(FlashMessage)`
  background: ${({theme}) => transparentize(theme.color.state.error, 0.03)};
`;

const FlashMessageSuccess = styled(FlashMessage)`
  background: ${({theme}) => transparentize(theme.color.state.success, 0.03)};
`;

const FlashMessageInfo = styled(FlashMessage)`
  background: ${({theme}) => transparentize(theme.color.state.attention, 0.03)};
`;

const Message = styled.p`
  margin: 0;

  :not(:last-child) {
    padding-bottom: ${({theme}) => theme.size.tiny};
  }
`;

const UndoLink = styled(Link)`
  /*
   * 1 - Create big click target for undo link by making it full width and adding vertical padding
   * 2 - Pull undo link over padding-bottom of flash-message to preserve the
   *     normal appearance of the flash-message padding
   */

  display: block; /* 1 */
  margin-bottom: -${({theme}) => theme.size.tiny}; /* 2 */
  padding: ${({theme}) => theme.size.tiny} 0; /* 1 */
`;

const FlashMessages = ({flashMessages}) => {
  if (!flashMessages || !(flashMessages.length > 0)) {
    return null;
  }

  return (
    <FlashMessagesContainer>
      {flashMessages.reverse().map(({actions, id, type, message}) => {
        const content = `
          ${message}
          ${actions && actions.button && <Button {...{fullWidth: true, size: 'small', ...actions.button}} />}
          ${actions &&
            actions.undo && (
              <UndoLink as="span" onClick={actions.undo.onClick}>
                {actions.undo.text}
              </UndoLink>
            )}
        `;

        let Component;
        switch (type) {
          case 'error':
            Component = FlashMessageError;
            break;

          case 'info':
            Component = FlashMessageInfo;
            break;

          case 'success':
            Component = FlashMessageSuccess;
            break;

          default:
            Component = FlashMessage;
        }

        return (
          <Component key={id}>
            <Message>{content}</Message>
          </Component>
        );
      })}
    </FlashMessagesContainer>
  );
};

FlashMessages.propTypes = {
  flashMessages: arrayOf(
    shape({
      actions: object,
      id: number,
      message: string.isRequired,
      type: oneOf(['error', 'info', 'success']),
    })
  ),
};

function mapStateToProps(state) {
  return {
    flashMessages: getFlashMessages(state),
  };
}

export default connect(mapStateToProps)(FlashMessages);
