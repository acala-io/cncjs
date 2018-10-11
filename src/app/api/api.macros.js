/* eslint-disable import/default */

import castArray from 'lodash/castArray';
import find from 'lodash/find';
import isPlainObject from 'lodash/isPlainObject';
import uuid from 'uuid';

import config from '../services/configstore';
import logger from '../lib/logger';
import settings from '../config/settings';
import {ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR} from '../constants';
import {getPagingRange} from './paging';

const log = logger('api:macros');
const CONFIG_KEY = 'macros';

const getSanitizedRecords = () => {
  const records = castArray(config.get(CONFIG_KEY, []));

  let shouldUpdate = false;
  for (let i = 0; i < records.length; ++i) {
    if (!isPlainObject(records[i])) {
      records[i] = {};
    }

    const record = records[i];

    if (!record.id) {
      record.id = uuid.v4();
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    log.debug(`update sanitized records: ${JSON.stringify(records)}`);

    // Pass `{ silent changes }` will suppress the change event
    config.set(CONFIG_KEY, records, {silent: true});
  }

  return records;
};

export const fetch = (req, res) => {
  const records = getSanitizedRecords();
  const paging = Boolean(req.query.paging);

  if (paging) {
    const {page = 1, pageLength = 10} = req.query;
    const totalRecords = records.length;
    const [begin, end] = getPagingRange({page, pageLength, totalRecords});
    const pagedRecords = records.slice(begin, end);

    res.send({
      pagination: {
        page: Number(page),
        pageLength: Number(pageLength),
        totalRecords: Number(totalRecords),
      },
      records: pagedRecords.map(record => {
        const {id, mtime, name, content} = {...record};

        return {
          content,
          id,
          mtime,
          name,
        };
      }),
    });
  } else {
    res.send({
      records: records.map(record => {
        const {id, mtime, name, content} = {...record};

        return {
          content,
          id,
          mtime,
          name,
        };
      }),
    });
  }
};

export const create = (req, res) => {
  const {name, content} = {...req.body};

  if (!name) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "name" parameter must not be empty',
    });
    return;
  }

  if (!content) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "content" parameter must not be empty',
    });
    return;
  }

  try {
    const records = getSanitizedRecords();
    const record = {
      id: uuid.v4(),
      mtime: new Date().getTime(),
      name,
      content,
    };

    records.push(record);
    config.set(CONFIG_KEY, records);

    res.send({err: null});
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
    });
  }
};

export const read = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id: id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  const {mtime, name, content} = {...record};
  res.send({id, mtime, name, content});
};

export const update = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id: id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  const {name = record.name, content = record.content} = {...req.body};

  /*
    if (!name) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "name" parameter must not be empty'
        });
        return;
    }

    if (!content) {
        res.status(ERR_BAD_REQUEST).send({
            msg: 'The "content" parameter must not be empty'
        });
        return;
    }
    */

  try {
    record.mtime = new Date().getTime();
    record.name = String(name || '');
    record.content = String(content || '');

    config.set(CONFIG_KEY, records);

    res.send({err: null});
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
    });
  }
};

export const __delete = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id: id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  try {
    const filteredRecords = records.filter(record => {
      return record.id !== id;
    });
    config.set(CONFIG_KEY, filteredRecords);

    res.send({err: null});
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
    });
  }
};
