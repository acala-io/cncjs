export const centerXY = `
  /*
   * 1 - Perceptive adjustment, because the visual vertical center is slightly above the geometric center
   */

  left: 50%;
  position: absolute;
  top: 48%; /* 1 */
  transform: translate(-50%, -50%);
`;

export const centerMX = `
  margin-left: auto;
  margin-right: auto;
`;
