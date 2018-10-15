// @flow
/* eslint-disable no-undef */

/*
 * Renders an icon that triggers an action on click, such as edit or delete.
 * Shows the name of the action in a custom tooltip on hover.
 *
 * Usage:
 * <ActionLink action="edit" onClick={() => { alert('clicked!'); }}/>
 */

import classcat from 'classcat';
import * as React from 'react';

import Icon from './Icon';

type Action = 'add' | 'cancel' | 'delete' | 'download' | 'duplicate' | 'edit' | string;

const TEXTS = {
  add: 'add',
  cancel: 'cancel',
  delete: 'delete',
  download: 'download',
  duplicate: 'duplicate',
  edit: 'edit',
};

export type Props = {
  action: Action,
  className: string,
  isDisabled: boolean,
  onClick: Function,
  renderWithLabel: boolean,
  style: any,
  title: string,
  tooltipPosition: 'above' | 'right' | 'below' | 'left',
};

function getOptions(action: string): {icon: string, text: string} {
  const defaultOptions = {
    icon: action,
    text: TEXTS[action] || action,
  };

  const options = {
    cancel: {
      text: TEXTS[action],
    },
    editOffer: {
      icon: 'edit',
      text: TEXTS[action],
    },
    showChanges: {
      icon: 'history',
      text: TEXTS[action],
    },
    try: {
      icon: 'try',
      text: TEXTS.preview,
    },
  };

  return options[action] || defaultOptions;
}

const ActionLinkIcon = ({type}: {type: string}) => <Icon name={type} size="small" />;

export default class ActionLink extends React.Component<Props> {
  static defaultProps = {
    className: '',
    isDisabled: false,
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
    const {action, className, isDisabled, renderWithLabel, style, title, tooltipPosition} = this.props;
    const options = getOptions(action);
    const showTooltip = options.icon ? !renderWithLabel : false;
    const classes = classcat([
      'edit-item dont-print',
      {
        'is-disabled': isDisabled,
        tooltip: showTooltip,
        'tooltip--above': showTooltip && tooltipPosition === 'above',
        'tooltip--below': showTooltip && tooltipPosition === 'below',
        'tooltip--left': showTooltip && tooltipPosition === 'left',
        'tooltip--right': showTooltip && tooltipPosition === 'right',
      },
      className,
    ]);

    return (
      <span
        className={classes}
        data-title={renderWithLabel ? null : title || options.text}
        data-sel-selector={action}
        onClick={this.onClick}
        style={style}
      >
        {options.icon ? <ActionLinkIcon type={options.icon} /> : null}
        {!options.icon || renderWithLabel ? <span>{options.text}</span> : null}
      </span>
    );
  }
}