/*
 * FormRow component for creating vertical margins between rows in a form.
 *
 * Usage:
 * <FormRow>
 *   <Input/>
 * </FormRow>
 * <FormRow>
 *   <Input/>
 * </FormRow>
 */

import styled from 'styled-components';

const FormRow = styled.div`
  :not(:first-of-type) {
    margin-top: ${({marginSize = 'default', theme}) => theme.size[marginSize]};
  }

  :empty {
    margin-top: 0;
  }
`;

export default FormRow;
