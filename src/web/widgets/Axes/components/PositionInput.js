import cx from 'classnames';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

class PositionInput extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    style: PropTypes.string,
  };
  static defaultProps = {
    defaultValue: '',
    min: -10000,
    max: 10000,
  };

  state = {
    value: this.props.defaultValue,
  };

  node = null;

  componentDidMount() {
    this.node.focus();
  }
  render() {
    const {onSave = noop, onCancel = noop, min, max, className, style} = this.props;
    const isNumber = this.state.value !== '';

    return (
      <div className={cx(className, 'input-group input-group-xs')} style={{...style, width: '100%'}}>
        <input
          ref={node => {
            this.node = node;
          }}
          type="number"
          className="form-control"
          placeholder=""
          style={{borderRight: 'none'}}
          value={this.state.value}
          onChange={event => {
            const value = event.target.value;

            if (value === '') {
              this.setState({value: ''});
              return;
            }
            if (value >= min && value <= max) {
              this.setState({value});
            }
          }}
          onKeyDown={event => {
            if (event.keyCode === 13) {
              // ENTER
              onSave(this.state.value);
            }
            if (event.keyCode === 27) {
              // ESC
              onCancel();
            }
          }}
        />
        <div className="input-group-btn">
          <button
            type="button"
            className="btn btn-default"
            disabled={!isNumber}
            onClick={() => {
              onSave(this.state.value);
            }}
          >
            <i className="fa fa-fw fa-check" />
          </button>
          <button
            type="button"
            className="btn btn-default"
            onClick={() => {
              onCancel();
            }}
          >
            <i className="fa fa-fw fa-close" />
          </button>
        </div>
      </div>
    );
  }
}

export default PositionInput;
