/*
 * Sections.
 * Just for creating vertical margins to structure a page.
 */

import styled from 'styled-components';

const Section = styled.section`

      :not(:first-of-type) {
          margin-top: ${({theme}) => theme.size.large};
      }

      :empty {
          margin-top: 0;
      }
  }
`;

export default Section;
