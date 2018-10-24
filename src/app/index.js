/* eslint-disable import/default */

import bcrypt from 'bcrypt-nodejs';
import chalk from 'chalk';
import dns from 'dns';
import ensureArray from 'ensure-array';
import expandTilde from 'expand-tilde';
import express from 'express';
import fs from 'fs';
import httpProxy from 'http-proxy';
import os from 'os';
import path from 'path';
import url from 'url';
import webappengine from 'webappengine';
import {escapeRegExp, set, size, trimEnd} from 'lodash';

import logger from './lib/logger';
import urljoin from './lib/urljoin';

import settings from './config/settings';

import cncengine from './services/cncengine';
import monitor from './services/monitor';
import config from './services/configstore';

import app from './app';

const log = logger('init');

const createServer = (options, callback) => {
  let localOptions = options;
  localOptions = {...localOptions};

  {
    // verbosity
    const verbosity = localOptions.verbosity;

    // https://github.com/winstonjs/winston#logging-levels
    switch (verbosity) {
      case 1:
        set(settings, 'verbosity', verbosity);
        logger.logger.level = 'verbose';
        break;

      case 2:
        set(settings, 'verbosity', verbosity);
        logger.logger.level = 'debug';
        break;

      case 3:
        set(settings, 'verbosity', verbosity);
        logger.logger.level = 'silly';
        break;
    }
  }

  const rcfile = path.resolve(localOptions.configFile || settings.rcfile);

  // configstore service
  log.info(`Loading configuration from ${chalk.yellow(JSON.stringify(rcfile))}`);
  config.load(rcfile);

  // rcfile
  settings.rcfile = rcfile;

  {
    // secret
    if (!config.get('secret')) {
      // generate a secret key
      const secret = bcrypt.genSaltSync(); // TODO: use a strong secret
      config.set('secret', secret);
    }

    settings.secret = config.get('secret', settings.secret);
  }

  {
    // watchDirectory
    const watchDirectory = localOptions.watchDirectory || config.get('watchDirectory');

    if (watchDirectory) {
      if (fs.existsSync(watchDirectory)) {
        log.info(`Watching ${chalk.yellow(JSON.stringify(watchDirectory))} for file changes`);

        // monitor service
        monitor.start({watchDirectory});
      } else {
        log.error(`The directory ${chalk.yellow(JSON.stringify(watchDirectory))} does not exist.`);
      }
    }
  }

  {
    // accessTokenLifetime
    const accessTokenLifetime = localOptions.accessTokenLifetime || config.get('accessTokenLifetime');

    if (accessTokenLifetime) {
      set(settings, 'accessTokenLifetime', accessTokenLifetime);
    }
  }

  {
    // allowRemoteAccess
    const allowRemoteAccess = localOptions.allowRemoteAccess || config.get('allowRemoteAccess', false);

    if (allowRemoteAccess) {
      if (size(config.get('users')) === 0) {
        log.warn(
          'You´ve enabled remote access to the server. It´s recommended to create an user account to protect against malicious attacks.'
        );
      }

      set(settings, 'allowRemoteAccess', allowRemoteAccess);
    }
  }

  const {port = 0, host, backlog} = localOptions;
  const routes = [];

  ensureArray(localOptions.mountPoints).forEach(mount => {
    if (!mount || !mount.route || mount.route === '/' || !mount.target) {
      log.error(`Must specify a valid route path ${mount && mount.route && JSON.stringify(mount.route)}.`);
      return;
    }

    if (mount.target.match(/^(http|https):\/\//i)) {
      log.info(
        `Starting a proxy server to proxy all requests starting with ${chalk.yellow(mount.route)} to ${chalk.yellow(
          mount.target
        )}`
      );

      routes.push({
        route: mount.route,
        type: 'server',
        server: options => {
          // route
          // > '/custom-widget/'
          // routeWithoutTrailingSlash
          // > '/custom-widget'
          // target
          // > 'https://cncjs.github.io/cncjs-widget-boilerplate/'
          // targetPathname
          // > '/cncjs-widget-boilerplate/'
          // proxyPathPattern
          // > RegExp('^/cncjs-widget-boilerplate/custom-widget')
          const {route = '/'} = {...options};
          const routeWithoutTrailingSlash = trimEnd(route, '/');
          const target = mount.target;
          const targetPathname = url.parse(target).pathname;
          const proxyPathPattern = new RegExp(
            `^${escapeRegExp(urljoin(targetPathname, routeWithoutTrailingSlash))}`,
            'i'
          );

          log.debug(`> route=${chalk.yellow(route)}`);
          log.debug(`> routeWithoutTrailingSlash=${chalk.yellow(routeWithoutTrailingSlash)}`);
          log.debug(`> target=${chalk.yellow(target)}`);
          log.debug(`> targetPathname=${chalk.yellow(targetPathname)}`);
          log.debug(`> proxyPathPattern=RegExp(${chalk.yellow(proxyPathPattern)})`);

          const proxy = httpProxy.createProxyServer({
            // Change the origin of the host header to the target URL
            changeOrigin: true,

            // Do not verify the SSL certificate for self-signed certs
            // secure: false,

            target,
          });

          proxy.on('proxyReq', proxyReq => {
            const originalPath = proxyReq.path || '';
            proxyReq.path = originalPath.replace(proxyPathPattern, targetPathname).replace('//', '/');

            log.debug(
              `proxy.on('proxyReq'): modifiedPath=${chalk.yellow(proxyReq.path)}, originalPath=${chalk.yellow(
                originalPath
              )}`
            );
          });

          proxy.on('proxyRes', proxyRes => {
            log.debug(`proxy.on('proxyRes'): headers=${JSON.stringify(proxyRes.headers, null, 2)}`);
          });

          const app = express();

          // Matched routes:
          //   /widget/
          //   /widget/v1/
          app.all(urljoin(routeWithoutTrailingSlash, '*'), (req, res) => {
            const url = req.url;
            log.debug(`proxy.web(): url=${chalk.yellow(url)}`);
            proxy.web(req, res);
          });

          // Matched routes:
          //   /widget
          app.all(routeWithoutTrailingSlash, (req, res, next) => {
            const url = req.url;
            // Redirect URL with a trailing slash
            if (url.indexOf(routeWithoutTrailingSlash) === 0 && url.indexOf(`${routeWithoutTrailingSlash}/`) < 0) {
              const redirectUrl = `${routeWithoutTrailingSlash}/${url.slice(routeWithoutTrailingSlash.length)}`;
              log.debug(`redirect: url=${chalk.yellow(url)}, redirectUrl=${chalk.yellow(redirectUrl)}`);
              res.redirect(301, redirectUrl);
              return;
            }

            next();
          });

          return app;
        },
      });
    } else {
      // expandTilde('~') => '/Users/<userhome>'
      const directory = expandTilde(mount.target || '').trim();

      log.info(
        `Mounting a directory ${chalk.yellow(JSON.stringify(directory))} to serve requests starting with ${chalk.yellow(
          mount.route
        )}`
      );

      if (!directory) {
        log.error(`The directory path ${chalk.yellow(JSON.stringify(directory))} must not be empty.`);
        return;
      }
      if (!path.isAbsolute(directory)) {
        log.error(`The directory path ${chalk.yellow(JSON.stringify(directory))} must be absolute.`);
        return;
      }
      if (!fs.existsSync(directory)) {
        log.error(`The directory path ${chalk.yellow(JSON.stringify(directory))} does not exist.`);
        return;
      }

      routes.push({
        directory,
        route: mount.route,
        type: 'static',
      });
    }
  });

  routes.push({
    route: '/',
    server: () => app(),
    type: 'server',
  });

  webappengine({backlog, host, port, routes})
    .on('ready', server => {
      // cncengine service
      cncengine.start(server, localOptions.controller || config.get('controller', ''));

      const address = server.address().address;
      const port = server.address().port;
      const filteredRoutes = routes.reduce((acc, r) => {
        const {type, route, directory} = r;
        if (type === 'static') {
          acc.push({
            directory,
            path: route,
          });
        }

        return acc;
      }, []);

      if (callback) {
        callback(null, {
          address,
          routes: filteredRoutes,
          port,
        });
      }

      if (address !== '0.0.0.0') {
        log.info(`Starting the server at ${chalk.yellow(`http://${address}:${port}`)}`);
        return;
      }

      dns.lookup(os.hostname(), {family: 4, all: true}, (err, addresses) => {
        if (err) {
          log.error('Can´t resolve host name:', err);
          return;
        }

        addresses.forEach(({address}) => {
          log.info(`Starting the server at ${chalk.yellow(`http://${address}:${port}`)}`);
        });
      });
    })
    .on('error', err => {
      if (callback) {
        callback(err);
      }
      log.error(err);
    });
};

export {createServer};
