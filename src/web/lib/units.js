import {IMPERIAL_UNITS, METRIC_UNITS, MM_PER_INCH} from '../constants';

export const mm2in = (val = 0) => val / MM_PER_INCH;

export const in2mm = (val = 0) => val * MM_PER_INCH;

export const mapValueToImperialUnits = value => {
  const v = Number(value) || 0;

  return Number(mm2in(v).toFixed(4));
};

export const mapValueToMetricUnits = value => {
  const v = Number(value) || 0;

  return Number(v.toFixed(3));
};

export const mapValueToUnits = (value, units = METRIC_UNITS) => {
  switch (units) {
    case IMPERIAL_UNITS:
      return mapValueToImperialUnits(value);

    case METRIC_UNITS:
      return mapValueToMetricUnits(value);
  }

  return Number(value) || 0;
};

export const mapPositionToImperialUnits = position => {
  const p = Number(position) || 0;

  return mm2in(p).toFixed(4);
};

export const mapPositionToMetricUnits = position => {
  const p = Number(position) || 0;

  return p.toFixed(3);
};

export const mapPositionToUnits = (position, units = METRIC_UNITS) => {
  switch (units) {
    case IMPERIAL_UNITS:
      return mapPositionToImperialUnits(position);

    case METRIC_UNITS:
      return mapPositionToMetricUnits(position);
  }

  return Number(position) || 0;
};
