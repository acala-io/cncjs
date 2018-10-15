/* eslint-disable import/default */

import evaluate from 'static-eval';
import {parse} from 'esprima';

import logger from './logger';

const log = logger('translateExpression');
const re = new RegExp(/\[[^\]]+\]/g);

const translateExpression = (data, context = {}) => {
  let localData = data;
  if (!localData) {
    return '';
  }

  try {
    localData = String(localData).replace(re, match => {
      const expr = match.slice(1, -1);
      const ast = parse(expr).body[0].expression;
      const value = evaluate(ast, context);

      return value !== undefined ? value : match;
    });
  } catch (e) {
    log.error(`translateExpression: data="${localData}", context=${JSON.stringify(context)}`);
    log.error(e);
  }

  return localData;
};

export default translateExpression;
