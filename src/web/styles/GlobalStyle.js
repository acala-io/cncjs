import {createGlobalStyle} from 'styled-components';

// import all the things from ./base
import text from './base/text';

const globalStyles = createGlobalStyle`
  ${text}
`;

export default globalStyles;
