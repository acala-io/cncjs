// @flow
/* eslint-disable no-undef */

/*
 * Renders an icon that triggers an action on click, such as edit or delete.
 * Shows the name of the action in a custom tooltip on hover.
 *
 * Usage:
 * <ActionLink action="edit" onClick={() => { alert('clicked!'); }} isDisabled={false} />
 */

import * as React from 'react';
import styled from 'styled-components';

import Icon from './Icon';

import mixin from '../styles/mixins/';

type Action = 'add' | 'cancel' | 'delete' | 'download' | 'duplicate' | 'edit' | 'run' | string;

const TEXTS = {
  add: 'add',
  cancel: 'cancel',
  delete: 'delete',
  download: 'download',
  edit: 'edit',
  run: 'run',
};

export type Props = {
  action: Action,
  label: string,
  isDisabled: boolean,
  onClick: Function,
  renderWithLabel: boolean,
};

function getOptions(action: string): {icon: string, text: string} {
  const defaultOptions = {
    icon: action,
    text: TEXTS[action] || action,
  };

  const options = {
    dunno: {
      icon: 'none',
      text: TEXTS[action],
    },
  };

  return options[action] || defaultOptions;
}

const ActionLinkIcon = ({type}: {type: string}) => <Icon name={type} />;

const StyledActionLink = styled.span`
  ${mixin.link};

  display: inline-block;
  font-weight: ${({theme}) => theme.font.weight.bold};
  padding: ${({theme}) => theme.size.tiny} ${({theme}) => theme.size.small};
  user-select: none;
  vertical-align: middle;
`;

const LinkText = styled.span`
  padding-left: ${({theme}) => theme.size.small};
`;

export default class ActionLink extends React.Component<Props> {
  static defaultProps = {
    className: '',
    isDisabled: false,
    label: '',
    renderWithLabel: false,
    style: {},
    title: '',
    tooltipPosition: 'above',
  };

  onClick = (e: SyntheticEvent<HTMLSpanElement>) => {
    const {isDisabled, onClick} = this.props;
    const f = onClick || function() {};

    if (isDisabled) {
      // "return false;" did not work for reasons that are beyond me, so let's just do it the verbose way
      e.preventDefault();
      e.stopPropagation();

      return;
    }

    // prevent the click to bubble up
    e.stopPropagation();

    f();
  };

  render() {
    const {action, label, renderWithLabel} = this.props;
    const options = getOptions(action);

    return (
      <StyledActionLink onClick={this.onClick}>
        {options.icon ? <ActionLinkIcon type={options.icon} /> : null}
        {!options.icon || renderWithLabel ? <LinkText>{label || options.text}</LinkText> : null}
      </StyledActionLink>
    );
  }
}
