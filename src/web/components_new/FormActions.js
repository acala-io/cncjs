// @flow
/*
 * Renders a row with the actions for a form.
 *
 * Usage:
 *
 * <FormActions
 *   primaryAction={text: 'save', handleClick: save}
 *   secondaryAction={handleClick: cancel}
 *   className="u-p-"
 * >
 *   ... tertiary action(s) go here
 * </FormActions>
 */

import classcat from 'classcat';
import * as React from 'react';
import PropTypes from 'prop-types';

import ActionLink from './ActionLink';
import Button from './Button';

export type Props = {
  children: ?any,
  className: ?string,
  noPad: boolean,
  primaryAction: any,
  secondaryAction: any,
};

const FormActions = ({children, className, noPad, primaryAction, secondaryAction}: Props) => {
  const primaryActionProps = {text: 'save', ...primaryAction};
  const classes = classcat(['form-actions', {'form-actions--no-padding': noPad}, className]);

  return (
    <div className={classes}>
      <div className="form-actions__primary">
        {primaryActionProps.handleClick && <Button {...primaryActionProps} />}
      </div>
      <div className="form-actions__secondary">
        {secondaryAction.handleClick && <ActionLink action="cancel" onClick={secondaryAction.handleClick} />}
      </div>
      <div className="form-actions__tertiary">{children}</div>
    </div>
  );
};

FormActions.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  className: PropTypes.string,
  noPad: PropTypes.bool,
};

/* eslint-disable react/default-props-match-prop-types */
FormActions.defaultProps = {
  children: null,
  className: '',
  noPad: false,
};

export default FormActions;
