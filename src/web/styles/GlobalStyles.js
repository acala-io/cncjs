import {createGlobalStyle} from 'styled-components';

import boxSizing from './base/boxSizing';
import headings from './base/headings';
import images from './base/images';
import inputs from './base/inputs';
import links from './base/links';
import normalize from './base/normalize';
import page from './base/page';
import placeholders from './base/placeholders';
import reset from './base/reset';
import shared from './base/shared';
import tables from './base/tables';
import text from './base/text';
import textareas from './base/textareas';

const GlobalStyles = createGlobalStyle`
  /*
   * GENERIC
   */
  ${boxSizing}
  ${normalize}
  ${reset}
  ${shared}

  /*
   * ELEMENTS
   */
  ${headings}
  ${images}
  ${inputs}
  ${links}
  ${page}
  ${placeholders}
  ${tables}
  ${textareas}
  ${text}
`;

export default GlobalStyles;
