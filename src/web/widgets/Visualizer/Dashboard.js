import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import VirtualList from 'react-tiny-virtual-list';
import {escape, get, throttle} from 'lodash';
import {ProgressBar} from 'react-bootstrap';

import api from '../../api';

import i18n from '../../lib/i18n';
import {formatBytes} from '../../lib/numeral';

import Anchor from '../../components/Anchor';
import Panel from '../../components/Panel';

import './dashboard.scss';

class Dashboard extends PureComponent {
  static propTypes = {
    show: PropTypes.bool,
    state: PropTypes.object,
  };

  node = {
    virtualList: null,
  };

  state = {
    virtualList: {
      visibleHeight: 0,
    },
  };

  lines = [];

  renderItem = ({index, style}) => (
    <div key={index} style={style}>
      <div className="line">
        <span className="label label-default">{index + 1}</span>
        {escape(this.lines[index])}
      </div>
    </div>
  );

  resizeVirtualList = throttle(() => {
    if (!this.node.virtualList) {
      return;
    }

    // eslint-disable-next-line react/no-find-dom-node
    const el = ReactDOM.findDOMNode(this.node.virtualList);
    const clientHeight = Number(el.clientHeight) || 0;

    if (clientHeight > 0) {
      this.setState(state => ({
        virtualList: {
          ...state.virtualList,
          visibleHeight: el.clientHeight,
        },
      }));
    }
  }, 32); // 60Hz

  componentDidMount() {
    this.resizeVirtualList();
    window.addEventListener('resize', this.resizeVirtualList);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeVirtualList);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.state.gcode.content !== this.props.state.gcode.content) {
      this.lines = get(nextProps, 'state.gcode.content', '')
        .split('\n')
        .filter(line => line.trim().length > 0);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.show !== prevProps.show && this.props.show) {
      this.resizeVirtualList();
    }
  }

  render() {
    const {show, state} = this.props;
    const style = {
      display: show ? 'block' : 'none',
    };
    const filename = state.gcode.name || 'noname.nc';
    const filesize = state.gcode.ready ? formatBytes(state.gcode.size, 0) : '';
    const {sent = 0, total = 0} = state.gcode;
    const {virtualList} = this.state;
    const rowHeight = 20;

    return (
      <Panel className="dashboard" style={style}>
        <Panel.Heading style={{height: 30}}>{i18n._('G-code')}</Panel.Heading>
        <Panel.Body style={{height: 'calc(100% - 30px)'}}>
          <div className="clearfix" style={{marginBottom: 10}}>
            <div className="pull-left text-nowrap">
              {state.gcode.ready && (
                <Anchor
                  onClick={() => {
                    const ident = state.connection.ident;
                    api.downloadGCode({ident});
                  }}
                >
                  <strong>{filename}</strong>
                </Anchor>
              )}
              {!state.gcode.ready && i18n._('G-code not loaded')}
            </div>
            <div className="pull-right text-nowrap">{filesize}</div>
          </div>
          <div style={{marginBottom: 10}}>
            <ProgressBar
              style={{marginBottom: 0}}
              bsStyle="info"
              min={0}
              max={total}
              now={sent}
              label={
                total > 0 && (
                  <span className="progressbar-label">
                    {sent}
                    &nbsp;/&nbsp;
                    {total}
                  </span>
                )
              }
            />
          </div>
          <div
            ref={node => {
              this.node.virtualList = node;
            }}
            className={classcat(['gcode-viewer', {'gcode-viewer-disabled': this.lines.length === 0}])}
          >
            {this.lines.length > 0 && (
              <VirtualList
                width="100%"
                height={virtualList.visibleHeight}
                style={{padding: '0 5px'}}
                itemCount={this.lines.length}
                itemSize={rowHeight}
                renderItem={this.renderItem}
                scrollToIndex={sent}
              />
            )}
            {this.lines.length === 0 && (
              <div className="absolute-center">
                <img src="images/logo-square-256x256.png" alt="" />
              </div>
            )}
          </div>
        </Panel.Body>
      </Panel>
    );
  }
}

export default Dashboard;
