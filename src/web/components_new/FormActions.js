/*
 * Renders a row with the actions for a form.
 *
 * Usage:
 *
 * <FormActions
 *   primaryAction={{text: 'save', onClick: save}}
 *   secondaryAction={{onClick: cancel}}
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
import Flexbox from './Flexbox';

const FormActions = ({children, className, primaryAction, secondaryAction}) => {
  const primaryActionProps = {text: 'save', ...primaryAction};
  const classes = classcat(['form-actions', className]);

  return (
    <Flexbox
      alignContent="flex-start"
      alignItems="center"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      style={{width: '100%'}}
      className={classes}
    >
      <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1}>
        {primaryActionProps.onClick && <Button {...primaryActionProps} />}
      </Flexbox>
      <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1}>
        {secondaryAction.onClick && <ActionLink action="cancel" onClick={secondaryAction.onClick} />}
      </Flexbox>
      <Flexbox flexGrow={100} flexShrink={0} style={{textAlign: 'right'}}>
        {children}
      </Flexbox>
    </Flexbox>
  );
};

FormActions.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  className: PropTypes.string,
  primaryAction: PropTypes.object,
  secondaryAction: PropTypes.object,
};

/* eslint-disable react/default-props-match-prop-types */
FormActions.defaultProps = {
  children: null,
  className: '',
};

export default FormActions;
