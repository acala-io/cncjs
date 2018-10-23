import {createGlobalStyle} from 'styled-components';

// import all the things from ./base
import boxSizing from './base/boxSizing';
import headings from './base/headings';
import images from './base/images';
import links from './base/links';
import normalize from './base/normalize';
import page from './base/page';
import placeholders from './base/placeholders';
import reset from './base/reset';
import shared from './base/shared';
import tables from './base/tables';
import text from './base/text';

const GlobalStyles = createGlobalStyle`
  // GENERIC
  ${boxSizing}
  ${normalize}
  ${reset}
  ${shared}

  // ELEMENTS
  ${headings}
  ${images}
  ${links}
  ${page}
  ${placeholders}
  ${tables}
  ${text}
}
`;

export default GlobalStyles;
