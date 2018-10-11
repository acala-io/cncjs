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

const log = logger('api:events');
const CONFIG_KEY = 'events';

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

    // Defaults to true
    if (record.enabled === undefined) {
      record.enabled = true;
    }

    // Alias command
    if (!record.commands) {
      record.commands = record.command || '';
      delete record.command;
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
        const {commands, id, enabled, event, mtime, trigger} = {...record};

        return {
          commands,
          enabled,
          event,
          id,
          mtime,
          trigger,
        };
      }),
    });
  } else {
    res.send({
      records: records.map(record => {
        const {commands, id, enabled, event, mtime, trigger} = {...record};

        return {
          commands,
          enabled,
          event,
          id,
          mtime,
          trigger,
        };
      }),
    });
  }
};

export const create = (req, res) => {
  const {enabled = true, event = '', trigger = '', commands = ''} = {...req.body};

  if (!event) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "event" parameter must not be empty',
    });
    return;
  }

  if (!trigger) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "trigger" parameter must not be empty',
    });
    return;
  }

  if (!commands) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "commands" parameter must not be empty',
    });
    return;
  }

  try {
    const records = getSanitizedRecords();
    const record = {
      commands,
      enabled: Boolean(enabled),
      event,
      id: uuid.v4(),
      mtime: new Date().getTime(),
      trigger,
    };

    records.push(record);
    config.set(CONFIG_KEY, records);

    res.send({
      id: record.id,
      mtime: record.mtime,
    });
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
    });
  }
};

export const read = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  const {commands, enabled, event, mtime, trigger} = {...record};

  res.send({
    commands,
    enabled,
    event,
    id,
    mtime,
    trigger,
  });
};

export const update = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  const {enabled = record.enabled, event = record.event, trigger = record.trigger, commands = record.commands} = {
    ...req.body,
  };

  // Skip validation for "enabled", "event", "trigger", and "commands"

  try {
    record.mtime = new Date().getTime();
    record.enabled = Boolean(enabled);
    record.event = String(event || '');
    record.trigger = String(trigger || '');
    record.commands = String(commands || '');

    // Remove deprecated parameter
    if (record.command !== undefined) {
      delete record.command;
    }

    config.set(CONFIG_KEY, records);

    res.send({
      id: record.id,
      mtime: record.mtime,
    });
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
    });
  }
};

export const __delete = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  try {
    const filteredRecords = records.filter(record => record.id !== id);
    config.set(CONFIG_KEY, filteredRecords);

    res.send({
      id: record.id,
    });
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to save ' + JSON.stringify(settings.rcfile),
    });
  }
};
