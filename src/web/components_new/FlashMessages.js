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
 *       props: {
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
 *       props: {
 *         undo: () => {
 *           alert('Clicked');
 *         },
 *       },
 *     }
 *   )
 * )
 */

import classcat from 'classcat';
import {arrayOf, number, object, oneOf, shape, string} from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {getFlashMessages} from '../reducers/flash';

import Button from './Button';

const FlashMessages = ({flashMessages}) => {
  if (!flashMessages || !(flashMessages.length > 0)) {
    return null;
  }

  return (
    <div className="flash-messages">
      {flashMessages.reverse().map(f => (
        <div
          key={f.id}
          className={classcat([
            'flash-message',
            {
              'flash-message--error': f.type === 'error',
              'flash-message--success': f.type === 'success',
            },
          ])}
        >
          <p>
            {f.message}
            {f.props && f.props.undo ? (
              <span className="link" onClick={f.props.undo}>
                {'undo'}
              </span>
            ) : null}
          </p>
          {f.props && f.props.button ? (
            <Button {...{
              fullWidth: true,
              size: 'small',
              ...f.props.button
            }} />
          ) : null}
        </div>
      ))}
    </div>
  );
};

FlashMessages.propTypes = {
  flashMessages: arrayOf(
    shape({
      id: number,
      message: string.isRequired,
      props: object,
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
