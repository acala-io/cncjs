import {createGlobalStyle} from 'styled-components';

// import all the things from ./base
import links from './base/links';
import placeholders from './base/placeholders';
import tables from './base/tables';
import text from './base/text';

const GlobalStyles = createGlobalStyle`
  ${links}
  ${placeholders}
  ${tables}
  ${text}
}
`;

export default GlobalStyles;
