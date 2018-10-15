import classcat from 'classcat';
import includes from 'lodash/includes';
import moment from 'moment';
import path from 'path';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '../../lib/i18n';
import {formatBytes} from '../../lib/numeral';

import Space from '../../components/Space';

import styles from './renderer.styl';

const TreeNode = props => {
  const {componentClass, id, selected, disabled, className, children, ...others} = props;
  const Component = componentClass || 'tr';

  return (
    <Component
      {...others}
      className={classcat([className, styles.treeNode, {[styles.selected]: selected}])}
      data-id={id}
      disabled={disabled}
    >
      {children}
    </Component>
  );
};
TreeNode.propTypes = {
  componentClass: PropTypes.node,
  disabled: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selected: PropTypes.bool,
};

const TreeNodeColumn = props => {
  const {className, children, padding = true, componentClass, ...others} = props;
  const Component = componentClass || 'td';

  return (
    <Component {...others} className={classcat([className, styles.treeNodeColumn, {[styles.noPadding]: !padding}])}>
      {children}
    </Component>
  );
};
TreeNodeColumn.propTypes = {
  componentClass: PropTypes.node,
  padding: PropTypes.bool,
};

const TreeNodeToggler = ({show, expanded}) => {
  if (!show) {
    return null;
  }

  return (
    <span className={styles.treeToggler}>
      <i
        className={classcat(['fa fa-fw', {'fa-chevron-down': expanded}, {'fa-chevron-right': !expanded}])}
        style={{
          opacity: expanded ? 1 : 0.5,
        }}
      />
    </span>
  );
};
TreeNodeToggler.propTypes = {
  expanded: PropTypes.bool,
  show: PropTypes.bool,
};

const TreeNodeLoader = ({show}) => {
  if (!show) {
    return null;
  }

  return (
    <i
      style={{marginLeft: 5}}
      className={classcat([{hidden: !show}, 'fa fa-circle-o-notch fa-fw', {'fa-spin': show}])}
    />
  );
};
TreeNodeLoader.propTypes = {
  show: PropTypes.bool,
};

const renderer = node => {
  let localNode = node;
  const {id, loadOnDemand = false} = localNode;
  const {depth, filtered, loading = false, open, selected = false} = localNode.state;
  const more = localNode.hasChildren();
  const paddingLeft = more || loadOnDemand ? depth * 18 : (depth + 1) * 18;

  if (filtered === false) {
    return '';
  }

  localNode.props = {...localNode.props};

  const disabled = (function(node) {
    let localNode = node;
    let {disabled = false} = localNode.props;

    while (localNode && localNode.parent) {
      if (localNode.props && localNode.props.disabled) {
        disabled = true;
        break;
      }
      localNode = localNode.parent;
    }

    return disabled;
  })(localNode);
  const dateModified = moment(localNode.props.mtime).format('lll');
  const size = includes(['f', 'l'], localNode.props.type) ? formatBytes(localNode.props.size, 0) : '';
  const type = (function(node) {
    if (node.props.type === 'd') {
      return i18n._('File folder');
    }

    if (node.props.type === 'f') {
      // path.extname('index.html')
      // -> '.html'
      // path.extname('index.')
      // -> '.'
      // path.extname('index')
      // -> ''
      const extname = path.extname(node.name || '').slice(1);
      return extname.length > 0
        ? i18n._('{{extname}} File', {extname: extname.toUpperCase()}) // e.g. NC File
        : i18n._('File');
    }

    return '';
  })(localNode);

  return (
    <TreeNode id={id} selected={selected} disabled={disabled}>
      <TreeNodeColumn>
        <div style={{paddingLeft: paddingLeft}}>
          <TreeNodeToggler show={more || loadOnDemand} expanded={more && open} />
          <i
            className={classcat([
              'fa',
              {'fa-folder-open-o': more && open},
              {'fa-folder-o': more && !open},
              {'fa-file-o': !more},
            ])}
          />
          <Space width="8" />
          {localNode.name}
          <TreeNodeLoader show={loading} />
        </div>
      </TreeNodeColumn>
      <TreeNodeColumn className="text-nowrap">{dateModified}</TreeNodeColumn>
      <TreeNodeColumn className="text-nowrap">{type}</TreeNodeColumn>
      <TreeNodeColumn className="text-nowrap text-right">{size}</TreeNodeColumn>
    </TreeNode>
  );
};

export default renderer;
