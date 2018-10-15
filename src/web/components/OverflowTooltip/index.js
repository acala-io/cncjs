import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

class OverflowTooltip extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };

  static getDerivedStateFromProps() {
    return {
      overflow: false,
    };
  }

  state = {
    overflow: false,
  };

  render() {
    const {title, ...props} = this.props;

    if (this.state.overflow) {
      props.title = title;
    }

    return <div {...props} />;
  }

  detectOverflow = () => {
    // eslint-disable-next-line react/no-find-dom-node
    const el = ReactDOM.findDOMNode(this);
    const overflow = el.clientWidth < el.scrollWidth;
    if (overflow !== this.state.overflow) {
      this.setState({overflow});
    }
  };

  componentDidMount() {
    this.detectOverflow();
  }

  componentDidUpdate() {
    this.detectOverflow();
  }
}

export default OverflowTooltip;
