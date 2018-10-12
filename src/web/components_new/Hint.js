/* @flow */
/*
 * Hint component.
 *
 * Usage:
 * <Hint block className="u-p">
 *   Please think before printing this website.
 * </Hint>
 */

import classcat from 'classcat';
import * as React from 'react';

export type Props = {
  block?: boolean,
  children?: React.Node,
  className?: string,
};

const Hint = ({block, children, className}: Props) => <dfn className={classcat([{block}, className])}>{children}</dfn>;

Hint.defaultProps = {
  block: false,
  className: '',
};

export default Hint;
