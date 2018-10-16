import InfiniteTree from 'react-infinite-tree';
import path from 'path';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import renderer from './renderer';

import api from '../../api';

import i18n from '../../lib/i18n';

import Modal from '../../components/Modal';

import './renderer.scss';

class WatchDirectory extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  tableNode = null;
  treeNode = null;

  render() {
    const {actions, state} = this.props;
    const {selectedNode = null} = state.modal.params;
    const canUpload = selectedNode && selectedNode.props.type === 'f';

    return (
      <Modal size="md" onClose={actions.closeModal}>
        <Modal.Header>
          <Modal.Title>{i18n._('Watch Directory')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table ref={ref => (this.tableNode = ref)} style={{width: '100%'}}>
            <thead>
              <tr>
                <th>{i18n._('Name')}</th>
                <th>{i18n._('Date modified')}</th>
                <th>{i18n._('Type')}</th>
                <th>{i18n._('Size')}</th>
              </tr>
            </thead>
          </table>
          <InfiniteTree
            style={{height: 240}}
            ref={node => {
              if (!this.treeNode) {
                this.treeNode = node;
                this.addColumnGroup();
              }
            }}
            noDataClass="no-data"
            togglerClass="tree-toggler"
            autoOpen
            layout="table"
            loadNodes={(parentNode, done) => {
              api.watch
                .getFiles({path: path.join(parentNode.props.path, parentNode.name)})
                .then(res => {
                  const body = res.body;
                  const nodes = body.files.map(file => {
                    const {name, ...props} = file;

                    return {
                      id: path.join(body.path, name),
                      loadOnDemand: props.type === 'd',
                      name,
                      props: {
                        ...props,
                        path: body.path || '',
                      },
                    };
                  });

                  done(null, nodes);
                })
                .catch(() => {
                  // Ignore error
                });
            }}
            rowRenderer={renderer}
            shouldSelectNode={node => {
              const tree = this.treeNode.tree;
              if (!node || node === tree.getSelectedNode()) {
                return false; // Prevent from desdelecting the current node
              }
              return true;
            }}
            onContentDidUpdate={() => {
              this.fitHeaderColumns();
            }}
            onKeyDown={event => {
              // Prevent the default scroll
              event.preventDefault();

              const tree = this.treeNode.tree;
              const node = tree.getSelectedNode();
              const nodeIndex = tree.getSelectedIndex();

              if (event.keyCode === 13) {
                // Enter
                if (!node) {
                  return;
                }
                const file = path.join(node.props.path, node.name);
                actions.loadFile(file);
                actions.closeModal();
              } else if (event.keyCode === 37) {
                // Left
                tree.closeNode(node);
              } else if (event.keyCode === 38) {
                // Up
                const prevNode = tree.nodes[nodeIndex - 1] || node;
                tree.selectNode(prevNode);
              } else if (event.keyCode === 39) {
                // Right
                tree.openNode(node);
              } else if (event.keyCode === 40) {
                // Down
                const nextNode = tree.nodes[nodeIndex + 1] || node;
                tree.selectNode(nextNode);
              }
            }}
            onSelectNode={node => {
              actions.updateModalParams({selectedNode: node});
            }}
            onDoubleClick={event => {
              event.stopPropagation();

              // Call setTimeout(fn, 0) to make sure it returns the last selected node
              setTimeout(() => {
                const tree = this.treeNode.tree;
                const node = tree.getSelectedNode();

                if (node) {
                  const file = path.join(node.props.path, node.name);
                  actions.loadFile(file);
                  actions.closeModal();
                }
              }, 0);
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default" onClick={actions.closeModal}>
            {i18n._('Cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const tree = this.treeNode.tree;
              const node = tree.getSelectedNode();

              if (node) {
                const file = path.join(node.props.path, node.name);
                actions.loadFile(file);
                actions.closeModal();
              }
            }}
            disabled={!canUpload}
          >
            {i18n._('Load G-code')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  componentDidMount() {
    this.addResizeEventListener();

    api.watch
      .getFiles({path: ''})
      .then(res => {
        const body = res.body;
        const data = body.files.map(file => {
          const {name, ...props} = file;

          return {
            id: path.join(body.path, name),
            loadOnDemand: props.type === 'd',
            name,
            props: {
              ...props,
              path: body.path || '',
            },
          };
        });

        const tree = this.treeNode.tree;
        tree.loadData(data);

        this.fitHeaderColumns();
      })
      .catch(() => {
        // Ignore error
      });
  }

  componentWillUnmount() {
    this.removeResizeEventListener();
  }

  addResizeEventListener() {
    window.addEventListener('resize', this.fitHeaderColumns);
  }

  removeResizeEventListener() {
    window.removeEventListener('resize', this.fitHeaderColumns);
  }

  addColumnGroup() {
    if (!this.treeNode) {
      return;
    }

    this.treeNode.tree.scrollElement.style.height = '240px';
    const table = this.treeNode.tree.contentElement.parentNode;
    const colgroup = document.createElement('colgroup');
    table.appendChild(colgroup);

    for (let i = 0; i < 4; ++i) {
      const col = document.createElement('col');
      colgroup.appendChild(col);
    }
  }

  fitHeaderColumns() {
    const ready = this.tableNode && this.treeNode;
    if (!ready) {
      return;
    }

    // eslint-disable-next-line react/no-find-dom-node
    const elTable = ReactDOM.findDOMNode(this.tableNode);
    const elTree = this.treeNode.tree.options.el;
    const tableHeaders = elTable.querySelectorAll('tr > th');
    const colgroup = elTree.querySelector('colgroup');
    const row = elTree.querySelector('tbody > tr');

    let i = 0;
    let child = row.firstChild;
    let col = colgroup.firstChild;
    while (child && col) {
      const width = Math.max(child.clientWidth, tableHeaders[i].clientWidth);
      col.style.minWidth = `${width}px`;
      col.style.width = `${width}px`;
      tableHeaders[i].style.width = `${width}px`;
      ++i;

      child = child.nextSibling;
      col = col.nextSibling;
    }
  }
}

export default WatchDirectory;
