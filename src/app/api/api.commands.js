/* eslint-disable import/default */

import uuid from 'uuid';
import {castArray, find, isPlainObject} from 'lodash';

import config from '../services/configstore';
import logger from '../lib/logger';
import settings from '../config/settings';
import taskRunner from '../services/taskrunner';
import {ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR} from '../constants';
import {getPagingRange} from './paging';

const log = logger('api:commands');
const CONFIG_KEY = 'commands';

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
        const {commands, enabled, id, mtime, title} = {...record};

        return {
          commands,
          enabled,
          id,
          mtime,
          title,
        };
      }),
    });
  } else {
    res.send({
      records: records.map(record => {
        const {commands, enabled, id, mtime, title} = {...record};

        return {
          commands,
          enabled,
          id,
          mtime,
          title,
        };
      }),
    });
  }
};

export const create = (req, res) => {
  const {enabled = true, title = '', commands = ''} = {...req.body};

  if (!title) {
    res.status(ERR_BAD_REQUEST).send({
      msg: 'The "title" parameter must not be empty',
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
      id: uuid.v4(),
      mtime: new Date().getTime(),
      title,
    };

    records.push(record);
    config.set(CONFIG_KEY, records);

    res.send({id: record.id, mtime: record.mtime});
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: `Failed to save ${JSON.stringify(settings.rcfile)}`,
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

  const {commands, enabled, mtime, title} = {...record};

  res.send({
    commands,
    enabled,
    id,
    mtime,
    title,
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

  const {commands = record.commands, enabled = record.enabled, title = record.title} = {...req.body};

  // Skip validation for "enabled", "title", and "commands"

  try {
    record.mtime = new Date().getTime();
    record.enabled = Boolean(enabled);
    record.title = String(title || '');
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
      msg: `Failed to save ${JSON.stringify(settings.rcfile)}`,
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
    const filteredRecords = records.filter(record => {
      return record.id !== id;
    });
    config.set(CONFIG_KEY, filteredRecords);

    res.send({id: record.id});
  } catch (err) {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({
      msg: `Failed to save ${JSON.stringify(settings.rcfile)}`,
    });
  }
};

export const run = (req, res) => {
  const id = req.params.id;
  const records = getSanitizedRecords();
  const record = find(records, {id});

  if (!record) {
    res.status(ERR_NOT_FOUND).send({
      msg: 'Not found',
    });
    return;
  }

  const title = record.title;
  const commands = record.commands;

  log.info(`run: title="${title}", commands="${commands}"`);

  const taskId = taskRunner.run(commands, title);

  res.send({taskId});
};
