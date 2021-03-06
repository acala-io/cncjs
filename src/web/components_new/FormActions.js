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

import React from 'react';
import {arrayOf, node, object, oneOfType, string} from 'prop-types';

import ActionLink from './ActionLink';
import Button from './Button';
import Flexbox from './Flexbox';

const FormActions = ({children, className, primaryAction, secondaryAction}) => {
  const primaryActionProps = {text: 'save', ...primaryAction};

  return (
    <Flexbox
      alignContent="flex-start"
      alignItems="center"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      style={{width: '100%'}}
      className={className}
    >
      <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1}>
        {primaryActionProps.onClick && <Button {...primaryActionProps} />}
      </Flexbox>
      <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1}>
        {secondaryAction.onClick && <ActionLink action="cancel" onClick={secondaryAction.onClick} renderWithLabel />}
      </Flexbox>
      <Flexbox flexGrow={100} flexShrink={0} style={{textAlign: 'right'}}>
        {children}
      </Flexbox>
    </Flexbox>
  );
};

FormActions.propTypes = {
  children: oneOfType([arrayOf(node), node]),
  className: string,
  primaryAction: object,
  secondaryAction: object,
};

FormActions.defaultProps = {
  children: null,
  className: '',
};

export default FormActions;
