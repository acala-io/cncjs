import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {bool, func, string} from 'prop-types';

import mixin from '../styles/mixins/';
import s from '../styles/theme';

// /*
//  * Styled checkbox.
//  */

// .checkbox {

//     &:hover {

//         .icon--checkbox {
//             border-color: $clickable--highlight;
//         }

//         .checkbox__input:not(:checked) + .icon--checkbox > .icon--checkbox__checkmark {
//             opacity: .21;
//         }
//     }

//     .icon--checkbox {
//         border: 1px solid $border;
//         border-radius: $border-radius;
//         display: inline-block;
//         height: 1.5em;
//         margin-right: .5em;
//         position: relative;
//         top: -.1em;
//         transition: border-color $transition-time--fast ease-in-out;
//         vertical-align: middle;
//         width: 1.5em;
//     }

//     .icon--checkbox__checkmark {
//         fill: $text;
//         opacity: 0;
//         transition: opacity $transition-time--fast;
//     }
// }

// // Variants ------------------------------------------------------------------------------------------------------------
// .checkbox--large {

//     .icon--checkbox {
//         border-width: 2px;
//     }
// }

const Label = styled.label`
  color: ${s.color.text.default};
  cursor: pointer;
  display: inline-block;
  font-weight: ${s.font.weight.normal};

  :hover {
    svg {
      border-color: ${s.color.clickable.highlight};
    }
  }
`;

const StyledCheckbox = styled.svg`
  ${mixin.input} height: 1.5em;
  margin-right: 0.5em;
  position: relative;
  top: -0.1em;
  transition: border-color ${s.transition.time.fast} ease-in-out;
  vertical-align: middle;
  width: 1.5em;
`;

const CheckmarkPath = () => (
  <path d="M34.3922425,50.6043978 L19.267992,35.4801474 C18.4869435,34.6990988 17.2206135,34.6990988 16.4395649,35.4801474 L10.9103584,41.0093539 C10.1293098,41.7904024 10.1293098,43.0567324 10.9103584,43.837781 L28.6849036,61.6123262 L32.9780289,65.9054515 C33.7590775,66.6865001 35.0254075,66.6865001 35.8064561,65.9054515 L74.2745715,27.437336 C75.0556201,26.6562874 75.0556201,25.3899575 74.2745715,24.6089089 L74.2745715,24.6089089 L68.745365,19.0797024 C67.9643164,18.2986538 66.6979865,18.2986538 65.9169379,19.0797024 L34.3922425,50.6043978 Z" />
);

const Checkmark = styled(CheckmarkPath)`
  fill: ${s.color.text.default};
  opacity: 0;
  transition: opacity ${s.transition.time.fast};
`;

const CheckedCheckmark = styled(CheckmarkPath)`
  fill: ${s.color.text.default};
`;

class Checkbox extends PureComponent {
  static propTypes = {
    checked: bool,
    className: string,
    isDisabled: bool,
    label: string.isRequired,
    onChange: func,
    onClick: func,
  };

  state = {checked: this.props.checked};

  render() {
    const {className, label} = this.props;
    const {checked} = this.state;

    return (
      <Label className={className} onClick={this.onClick}>
        <StyledCheckbox role="img" viewBox="0 0 84 84">
          {checked ? <CheckedCheckmark /> : <Checkmark />}
        </StyledCheckbox>
        {label}
      </Label>
    );
  }

  onClick = () => {
    const {isDisabled, onChange, onClick} = this.props;

    if (isDisabled) {
      return;
    }

    const callbacks = () => {
      const {checked} = this.state;

      onChange(checked);
      onClick(checked);
    };

    return this.setState(
      state => ({
        checked: !state.checked,
      }),
      callbacks()
    );
  };
}

export default Checkbox;
