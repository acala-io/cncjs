import {css} from 'styled-components';

const headings = css`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: normal;
  }

  h1 {
    font-size: ${({theme}) => theme.color.text.huge};
    text-align: center;
  }

  h2 {
    font-size: ${({theme}) => theme.color.text.large};
  }

  h3,
  h4,
  h5,
  h6 {
    font-size: ${({theme}) => theme.color.text.large};
  }
`;

export default headings;
