import * as fit from 'xterm/lib/addons/fit/fit';
import classcat from 'classcat';
import color from 'cli-color';
import PerfectScrollbar from 'perfect-scrollbar';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {Terminal} from 'xterm';
import {trimEnd} from 'lodash';

import log from '../../lib/log';

import History from './History';

Terminal.applyAddon(fit);

class TerminalWrapper extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    cols: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cursorBlink: PropTypes.bool,
    onData: PropTypes.func,
    rows: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    scrollback: PropTypes.number,
    style: PropTypes.object,
    tabStopWidth: PropTypes.number,
  };

  static defaultProps = {
    cols: 'auto',
    cursorBlink: true,
    onData: () => {},
    rows: 'auto',
    scrollback: 1000,
    tabStopWidth: 4,
  };

  prompt = '> ';
  history = new History(1000);
  verticalScrollbar = null;
  terminalContainer = null;
  term = null;

  render() {
    const {className, style} = this.props;

    return (
      <div
        ref={ref => (this.terminalContainer = ref)}
        className={classcat([className, 'terminal-container'])}
        style={style}
      />
    );
  }

  eventHandler = {
    onResize: () => {
      const {rows, cols} = this.term;
      log.debug(`Resizing the terminal to ${rows} rows and ${cols} cols`);

      if (this.verticalScrollbar) {
        this.verticalScrollbar.update();
      }
    },
    onKey: (() => {
      let historyCommand = '';

      return (key, event) => {
        const {onData} = this.props;
        const term = this.term;
        const line = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
        const nonPrintableKey = event.altKey || event.altGraphKey || event.ctrlKey || event.metaKey;

        if (!line) {
          return;
        }

        // Home
        if (event.key === 'Home' || (event.metaKey && event.key === 'ArrowLeft')) {
          term.buffer.x = this.prompt.length;
          return;
        }

        // End
        if (event.key === 'End' || (event.metaKey && event.key === 'ArrowRight')) {
          let x = line.length - 1;
          for (; x > this.prompt.length; --x) {
            const c = line[x][1].trim();
            if (c) {
              break;
            }
          }

          if (x + 1 < line.length - 1) {
            term.buffer.x = x + 1;
          }

          return;
        }

        // Enter
        if (event.key === 'Enter') {
          let buffer = '';
          for (let x = this.prompt.length; x < line.length; ++x) {
            const c = line[x][1] || '';
            buffer += c;
          }
          buffer = trimEnd(buffer);

          if (buffer.length > 0) {
            // Clear history command
            historyCommand = '';

            // Reset the index to the last position of the history array
            this.history.resetIndex();

            // Push the buffer to the history list, not including the [Enter] key
            this.history.push(buffer);
          }

          buffer += key;

          log.debug('xterm>', buffer);

          onData(buffer);
          term.prompt();
          return;
        }

        // Backspace
        if (event.key === 'Backspace') {
          // Do not delete the prompt
          if (term.buffer.x <= this.prompt.length) {
            return;
          }

          for (let x = term.buffer.x; x < line.length; ++x) {
            line[x - 1] = line[x];
          }
          line[line.length - 1] = [term.eraseAttr(), ' ', 1];
          term.updateRange(term.buffer.y);
          term.refresh(term.buffer.y, term.buffer.y);
          term.write('\b');

          return;
        }

        // Delete
        if (event.key === 'Delete') {
          for (let x = term.buffer.x + 1; x < line.length; ++x) {
            line[x - 1] = line[x];
          }
          line[line.length - 1] = [term.eraseAttr(), ' ', 1, 32];
          term.updateRange(term.buffer.y);
          term.refresh(term.buffer.y, term.buffer.y);

          return;
        }

        // Escape
        if (event.key === 'Escape') {
          term.eraseLine(term.buffer.y);
          term.buffer.x = 0;
          term.write(color.white(this.prompt));
          return;
        }

        // ArrowLeft
        if (event.key === 'ArrowLeft') {
          if (term.buffer.x <= this.prompt.length) {
            return;
          }
          term.buffer.x--;
          return;
        }

        // ArrowRight
        if (event.key === 'ArrowRight') {
          let x = line.length - 1;
          for (; x > 0; --x) {
            const c = line[x][1].trim();
            if (c) {
              break;
            }
          }
          if (term.buffer.x <= x) {
            term.buffer.x++;
          }

          return;
        }

        // ArrowUp
        if (event.key === 'ArrowUp') {
          if (!historyCommand) {
            historyCommand = this.history.current() || '';
          } else if (this.history.index > 0) {
            historyCommand = this.history.back() || '';
          }
          term.eraseLine(term.buffer.y);
          term.buffer.x = 0;
          term.write(color.white(this.prompt));
          term.write(color.white(historyCommand));
          return;
        }

        // ArrowDown
        if (event.key === 'ArrowDown') {
          historyCommand = this.history.forward() || '';
          term.eraseLine(term.buffer.y);
          term.buffer.x = 0;
          term.write(color.white(this.prompt));
          term.write(color.white(historyCommand));
          return;
        }

        // PageUp
        if (event.key === 'PageUp') {
          // Unsupported
          return;
        }

        // PageDown
        if (event.key === 'PageDown') {
          // Unsupported
          return;
        }

        // Non-printable keys (e.g. ctrl-x)
        if (nonPrintableKey) {
          onData(key);
          return;
        }

        // Make sure the cursor position will not exceed the number of columns
        if (term.buffer.x < term.cols) {
          let x = line.length - 1;
          for (; x > term.buffer.x; --x) {
            line[x] = line[x - 1];
          }
          term.write(color.white(key));
        }
      };
    })(),
    onPaste: data => {
      const {onData} = this.props;
      const lines = String(data)
        .replace(/(\r\n|\r|\n)/g, '\n')
        .split('\n');
      for (let i = 0; i < lines.length; ++i) {
        const line = lines[i];
        onData(line);
        this.term.write(color.white(line));
        this.term.prompt();
      }
    },
  };

  componentDidMount() {
    const {cursorBlink, scrollback, tabStopWidth} = this.props;

    this.term = new Terminal({
      cursorBlink,
      scrollback,
      tabStopWidth,
    });
    this.term.prompt = () => {
      this.term.write('\r\n');
      this.term.write(color.white(this.prompt));
    };
    this.term.on('resize', this.eventHandler.onResize);
    this.term.on('key', this.eventHandler.onKey);
    this.term.on('paste', this.eventHandler.onPaste);

    // eslint-disable-next-line react/no-find-dom-node
    const el = ReactDOM.findDOMNode(this.terminalContainer);
    this.term.open(el);
    this.term.fit();
    this.term.focus(false);

    this.term.setOption(
      'fontFamily',
      'Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif'
    );

    const xtermElement = el.querySelector('.xterm');
    xtermElement.style.paddingLeft = '3px';

    const viewportElement = el.querySelector('.xterm-viewport');
    this.verticalScrollbar = new PerfectScrollbar(viewportElement);

    this.resize();
  }
  componentWillUnmount() {
    if (this.verticalScrollbar) {
      this.verticalScrollbar.destroy();
      this.verticalScrollbar = null;
    }

    if (this.term) {
      this.term.off('resize', this.eventHandler.onResize);
      this.term.off('key', this.eventHandler.onKey);
      this.term.off('paste', this.eventHandler.onPaste);
      this.term = null;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.cursorBlink !== this.props.cursorBlink) {
      this.term.setOption('cursorBlink', nextProps.cursorBlink);
    }

    if (nextProps.scrollback !== this.props.scrollback) {
      this.term.setOption('scrollback', nextProps.scrollback);
    }

    if (nextProps.tabStopWidth !== this.props.tabStopWidth) {
      this.term.setOption('tabStopWidth', nextProps.tabStopWidth);
    }
  }

  componentDidUpdate(prevProps) {
    const {cols, rows} = this.props;

    if (cols !== prevProps.cols || rows !== prevProps.rows) {
      this.resize(cols, rows);
    }
  }

  // http://www.alexandre-gomes.com/?p=115
  getScrollbarWidth() {
    const inner = document.createElement('p');
    inner.style.width = '100%';
    inner.style.height = '200px';

    const outer = document.createElement('div');
    outer.style.position = 'absolute';
    outer.style.top = '0px';
    outer.style.left = '0px';
    outer.style.visibility = 'hidden';
    outer.style.width = '200px';
    outer.style.height = '150px';
    outer.style.overflow = 'hidden';
    outer.appendChild(inner);

    document.body.appendChild(outer);
    const w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    const w2 = w1 === inner.offsetWidth ? outer.clientWidth : inner.offsetWidth;
    document.body.removeChild(outer);

    return w1 - w2;
  }

  resize(cols = this.props.cols, rows = this.props.rows) {
    let localCols = cols;
    let localRows = rows;
    if (!(this.term && this.term.element)) {
      return;
    }

    const geometry = fit.proposeGeometry(this.term);
    if (!geometry) {
      return;
    }

    localCols = !localCols || localCols === 'auto' ? geometry.cols : localCols;
    localRows = !localRows || localRows === 'auto' ? geometry.rows : localRows;
    this.term.resize(localCols, localRows);
  }

  clear() {
    this.term.clear();
  }

  selectAll() {
    this.term.selectAll();
  }

  clearSelection() {
    this.term.clearSelection();
  }

  write(data) {
    this.term.write(data);
  }

  writeln(data) {
    this.term.eraseRight(0, this.term.buffer.y);
    this.term.write('\r');
    this.term.write(data);
    this.term.prompt();
  }
}

export default TerminalWrapper;
