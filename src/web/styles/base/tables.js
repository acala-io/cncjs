import {css} from 'styled-components';

const tables = css`
  /*
   * Default table styles plus a few styling variants.
   * auto-zebra:  automatically switch to zebra striping when exceeding a defined number of rows
   * scrollable:  with scrollbars and fixed height
   * row-hovers:  apply hover effect to rows
   */

  table {
    margin-bottom: 0;
  }

  th {
    color: ${({theme}) => theme.color.text.lighter};
    font-weight: ${({theme}) => theme.font.weight.normal};
    padding: 0.25em 1em 0.25em 0.25em;
    text-align: left;
    vertical-align: bottom;
  }

  td,
  tbody th {
    padding: 0.25em;
    vertical-align: top;
  }

  .number-cell, // <- TODO
  td.number {
    text-align: right;

    big {
      font-size: ${({theme}) => theme.font.size.large};
    }

    big + small,
    big + sup {
      margin-left: 0.5em;
      top: -1.2em;
    }
  }

  tr.summary-row {
    // <- TODO
    td,
    th {
      font-weight: ${({theme}) => theme.font.weight.bold};
    }
  }

  .table {
    margin-bottom: 0;

    td,
    th {
      padding: 0.5em 0.75em;
    }

    thead tr {
      border-bottom: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.darker};
    }

    tfoot tr {
      border-top: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.darker};
    }
  }

  // Variants ----------------------------------------------------------------------------------------------------------
  .table--row-hovers {
    // <- TODO
    tr {
      transition: background ${({theme}) => theme.transition.time.veryFast} ease-out;

      &:hover {
        background: ${({theme}) => theme.color.background.clickable} !important;
      }
    }
  }

  .table--scrollable {
    // <- TODO
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .table--auto-zebra {
    // <- TODO
    // if there are 6 or more rows, apply zebra-striping to rows instead of borders
    tr:nth-last-child(n + 6) ~ tr,
    tr:nth-last-child(n + 6):first-child {
      border-bottom: 0 !important;

      &:nth-child(even) {
        background: ${({theme}) => theme.color.background.lighter};
      }
    }
  }
`;

export default tables;
