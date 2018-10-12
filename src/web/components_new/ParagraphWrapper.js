/*
 * Wraps a string in defined markup, e.g. for rendering an array of strings as list or paragraphs.
 * Renders the passed data as plain text by default, but can optionally render as HTML as well.
 *
 * Usage:
 * <ParagraphWrapper data="This is a <strong>paragraph</strong>" wrapIn="p" type="HTML"/>
 */

import React, {Fragment} from 'react';
import {oneOf, string} from 'prop-types';

const ParagraphWrapper = ({className = '', data, type = 'plain text', wrapIn = 'p'}) => {
  if (type === 'HTML') {
    switch (wrapIn) {
      case 'li':
        return <li className={className} dangerouslySetInnerHTML={{__html: data}} />;

      case 'li dfn':
        return (
          <li className={className}>
            <dfn dangerouslySetInnerHTML={{__html: data}} />
          </li>
        );

      case 'div':
        return <div className={className} dangerouslySetInnerHTML={{__html: data}} />;

      case 'p':
      default:
        return <p className={className} dangerouslySetInnerHTML={{__html: data}} />;
    }
  } else {
    switch (wrapIn) {
      case 'li':
        return <li className={className}>{data}</li>;

      case 'li dfn':
        return (
          <li className={className}>
            <dfn>{data}</dfn>
          </li>
        );

      case 'dfn br':
        return (
          <Fragment>
            <dfn className={className}>{data}</dfn>
            <br />
          </Fragment>
        );

      case 'div':
        return <div className={className}>{data}</div>;

      case 'p':
      default:
        return <p className={className}>{data}</p>;
    }
  }
};

ParagraphWrapper.propTypes = {
  className: string,
  data: string.isRequired,
  type: oneOf(['HTML', 'plain text']),
  wrapIn: string,
};

export default ParagraphWrapper;
