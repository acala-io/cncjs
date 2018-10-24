/*
 * Uploader component as styled file input.
 *
 * Usage:
 * TBD
 */

import React from 'react';
import styled from 'styled-components';
import {bool, func, object, string} from 'prop-types';

import Button from './Button';

import mixin from '../styles/mixins/';

const StyledFileInput = ({buttonText, className, disabled, icon, multiple, onChange, style}) => (
  <Button as="div" text={buttonText} icon={icon} className={className} style={style} disabled={disabled}>
    <ActualInput multiple={multiple} onChange={onChange} disabled={disabled} />
  </Button>
);

StyledFileInput.propTypes = {
  buttonText: string,
  className: string,
  disabled: bool,
  icon: string,
  multiple: bool,
  onChange: func.isRequired,
  style: object,
};

const ActualInput = styled.input.attrs({
  type: 'file',
})`
  ${mixin.hidden};
`;

const Uploader = ({
  buttonText = 'Upload',
  className = '',
  disabled = false,
  icon = 'upload',
  multiple = false,
  onChange,
  style = {},
}) => (
  <StyledFileInput
    buttonText={buttonText}
    icon={icon}
    className={className}
    style={style}
    onChange={onChange}
    multiple={multiple}
    disabled={disabled}
  />
);

Uploader.propTypes = {
  buttonText: string,
  className: string,
  disabled: bool,
  icon: string,
  multiple: bool,
  onChange: func.isRequired,
  style: object,
};

export default Uploader;
