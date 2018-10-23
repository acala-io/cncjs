const images = `
  /* ==========================================================================
     #IMAGES
     ========================================================================== */

  /**
   * 1. Fluid images for responsive purposes.
   * 2. Offset 'alt' text from surrounding copy.
   * 3. Setting 'vertical-align' removes the whitespace that appears under 'img'
   *    elements when they are dropped into a page as-is. Safer alternative to
   *    using 'display: block;'.
   */

  img {
    font-style: italic; /* [2] */
    max-width: 100%; /* [1] */
    vertical-align: middle; /* [3] */
  }
`;

export default images;