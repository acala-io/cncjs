import {createGlobalStyle} from 'styled-components';

// import all the things from ./base
import tables from './base/tables';
import text from './base/text';

const globalStyles = createGlobalStyle`
  ${tables}
  ${text}
}
`;

export default globalStyles;
