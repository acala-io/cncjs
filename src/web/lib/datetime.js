import {parse, toDate} from 'date-fns';

export const parseDate = (string, format = undefined) => {
  if (string instanceof Date) {
    return string;
  }

  if (format) {
    return parse(string, format, new Date());
  }

  return toDate(string);
};
