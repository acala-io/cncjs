import localeDe from 'date-fns/locale/de';
import moment from 'moment';
import {format} from 'date-fns';

export function formatNumber(
  number,
  precision = 3,
  formatSign = false,
  separator = {
    decimal: ',',
    thousand: '.',
  }
) {
  const toFixed = (value, prec) => {
    const power = Math.pow(10, prec);

    // Multiply up by precision, round accurately, then divide and use native toFixed()
    return (Math.round((value + 1e-8) * power) / power).toFixed(prec);
  };

  let sign = '';
  if (parseFloat(number) < 0) {
    sign = '– ';
  } else if (formatSign && parseFloat(number) > 0) {
    sign = '+ ';
  }

  const base = String(parseInt(toFixed(Math.abs(number), precision), 10));
  const mod = base.length > 3 ? base.length % 3 : 0;

  return (
    sign +
    (mod ? base.substr(0, mod) + separator.thousand : '') +
    base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + separator.thousand) +
    (precision > 0 ? separator.decimal + toFixed(Math.abs(number), precision).split('.')[1] : '')
  );
}

export const numberOfDigits = num => {
  // assert that num can't be undefined
  if (num === undefined) {
    return 0;
  }

  return (num.toString().split('.')[1] || []).length;
};

export const formatDate = (date, dateFormat) => format(date, dateFormat, {locale: localeDe});

export const dateLocalizedWOYear = 'D. MMMM';
export const dateLocalizedWOYearShort = 'D.M.';
export const dateLong = 'D.MM.YYYY';
export const dateMonthYear = 'M/YYYY';
export const datetime4server = 'YYYY-MM-DD[T]H:mm:ss';
export const time24h = 'H:mm';

// TODO: replace with date-fns as soon as incoming data format is known
export const formatDuration = duration => {
  if (!duration || duration < 0) {
    return '–';
  }

  const d = moment.duration(elapsedTime, 'ms');

  return moment(d._data).format('HH:mm:ss');
};
