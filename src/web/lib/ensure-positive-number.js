const ensurePositiveNumber = (value, minimumValue = 0) => {
  let localMinimumValue = minimumValue;
  // In comparison to the global isFinite() function,
  // the Number.isFinite() method doesn't forcibly convert the parameter to a number.
  if (!Number.isFinite(localMinimumValue) || localMinimumValue < 0) {
    localMinimumValue = 0;
  }

  return Math.max(Number(value) || 0, localMinimumValue);
};

export default ensurePositiveNumber;
