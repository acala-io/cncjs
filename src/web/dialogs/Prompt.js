import React, {Component} from 'react';
import {array, func, oneOf, oneOfType, string} from 'prop-types';
import {isEnter, isEsc} from '../lib/key-events';

import Button from '../components_new/Button';
import Hint from '../components_new/Hint';
import ParagraphWrapper from '../components_new/ParagraphWrapper';
import {Dialog, DialogActions, DialogHeader} from '../components_new/Dialog';

class Prompt extends Component {
  static propTypes = {
    buttonText: string,
    comparison: oneOf(['equality', 'containedInArray']),
    expected: oneOfType([string, array]).isRequired,
    explanation: oneOfType([string, array]).isRequired,
    heading: string.isRequired,
    onClose: func.isRequired,
    onConfirm: func.isRequired,
  };

  static defaultProps = {
    buttonText: 'save',
    comparison: 'equality',
  };

  state = {
    userInput: '',
  };

  checkUserInput = e => {
    if (isEnter(e) && this.state.userInput.length >= 2) {
      this.props.onConfirm(this.isValid);
    }

    if (isEsc(e)) {
      this.props.onClose();
    }
  };

  updateUserInput = e => {
    this.setState({
      userInput: e.target.value,
    });
  };

  closeDialog = () => {
    this.props.onClose();
  };

  confirmValidity = () => {
    this.props.onConfirm(this.isValid);
  };

  render() {
    return (
      <Dialog width="wide" onClose={this.closeDialog}>
        <DialogHeader heading={this.props.heading} />
        {this.explanation}
        {this.fields}
        {this.actions}
      </Dialog>
    );
  }

  get isValid() {
    let isValid = false;
    if (this.props.comparison === 'equality') {
      isValid = this.props.expected === this.state.userInput.trim();
    } else if (this.props.comparison === 'containedInArray') {
      isValid = this.props.expected.includes(this.state.userInput.trim());
    }

    return isValid;
  }

  get explanation() {
    const {explanation} = this.props;

    if (Array.isArray(explanation)) {
      return (
        <Hint block className="text--centered u-mh+ u-mb">
          {explanation.map((paragraph, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <ParagraphWrapper key={i} data={paragraph} type="HTML" wrapIn="p" className="u-mb-" />
          ))}
        </Hint>
      );
    }

    return <dfn className="block text--centered u-mh+ u-mb" dangerouslySetInnerHTML={{__html: explanation}} />;
  }

  get fields() {
    return (
      <div className="u-mh+ u-mb+">
        <input
          type="text"
          value={this.state.userInput}
          className="input--large input--long"
          autoFocus
          onChange={this.updateUserInput}
          onKeyDown={this.checkUserInput}
        />
      </div>
    );
  }

  get actions() {
    return (
      <DialogActions>
        <Button
          text={this.props.buttonText}
          isDisabled={this.state.userInput.length < 2}
          onClick={this.confirmValidity}
        />
      </DialogActions>
    );
  }
}

export default Prompt;
