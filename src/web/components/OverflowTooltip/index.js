import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

class OverflowTooltip extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };

  state = {
    overflow: false,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      overflow: false,
    };
  }

  detectOverflow = () => {
    // eslint-disable-next-line react/no-find-dom-node
    const el = ReactDOM.findDOMNode(this);
    const overflow = el.clientWidth < el.scrollWidth;
    if (overflow !== this.state.overflow) {
      this.setState({overflow: overflow});
    }
  };

  componentDidMount() {
    this.detectOverflow();
  }

  componentDidUpdate() {
    this.detectOverflow();
  }

  render() {
    const {title, ...props} = this.props;

    if (this.state.overflow) {
      props.title = title;
    }

    return <div {...props} />;
  }
}

export default OverflowTooltip;
