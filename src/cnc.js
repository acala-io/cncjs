/* eslint max-len: 0 */
/* eslint no-console: 0 */
import path from 'path';
import isElectron from 'is-electron';
import program from 'commander';

import pkg from './package.json';

// Defaults to 'production'
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const increaseVerbosityLevel = (val, total) => {
  return total + 1;
};

const parseMountPoint = (val, acc) => {
  let localVal = val;
  localVal = localVal || '';

  const mount = {
    route: '/',
    target: localVal,
  };

  if (localVal.indexOf(':') >= 0) {
    const r = localVal.match(/(?:([^:]*)(?::(.*)))/);
    mount.route = r[1];
    mount.target = r[2];
  }

  mount.route = path.join('/', mount.route || '').trim(); // path.join('/', 'pendant') => '/pendant'
  mount.target = (mount.target || '').trim();

  acc.push(mount);

  return acc;
};

const parseController = val => {
  let localVal = val;
  localVal = localVal ? String(localVal).toLowerCase() : '';

  if (['grbl', 'marlin', 'smoothie', 'tinyg', 'g2core'].includes(localVal)) {
    return localVal;
  } else {
    return '';
  }
};

const defaultHost = isElectron() ? '127.0.0.1' : '0.0.0.0';
const defaultPort = isElectron() ? 0 : 8000;

program
  .version(pkg.version)
  .usage('[options]')
  .option('-p, --port <port>', `Set listen port (default: ${defaultPort})`, defaultPort)
  .option('-H, --host <host>', `Set listen address or hostname (default: ${defaultHost})`, defaultHost)
  .option('-b, --backlog <backlog>', 'Set listen backlog (default: 511)', 511)
  .option('-c, --config <filename>', 'Set config file (default: ~/.cncrc)')
  .option('-v, --verbose', 'Increase the verbosity level (-v, -vv, -vvv)', increaseVerbosityLevel, 0)
  .option('-m, --mount <route-path>:<target>', 'Add a mount point for serving static files', parseMountPoint, [])
  .option('-w, --watch-directory <path>', 'Watch a directory for changes')
  .option('--access-token-lifetime <lifetime>', 'Access token lifetime in seconds or a time span string (default: 30d)')
  .option('--allow-remote-access', 'Allow remote access to the server (default: false)')
  .option(
    '--controller <type>',
    "Specify CNC controller: Grbl|Marlin|Smoothie|TinyG|g2core (default: '')",
    parseController,
    ''
  );

program.on('--help', () => {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log('    $ cnc -vv');
  console.log('    $ cnc --mount /pendant:/home/pi/tinyweb');
  console.log('    $ cnc --mount /widget:~+/widget --mount /pendant:~/pendant');
  console.log('    $ cnc --mount /widget:https://cncjs.github.io/cncjs-widget-boilerplate/v2/');
  console.log('    $ cnc --watch-directory /home/pi/watch');
  console.log('    $ cnc --access-token-lifetime 60d  # e.g. 3600, 30m, 12h, 30d');
  console.log('    $ cnc --allow-remote-access');
  console.log('    $ cnc --controller Grbl');
  console.log('');
});

// Commander assumes that the first two values in argv are 'node' and appname, and then followed by the args.
// This is not the case when running from a packaged Electron app. Here you have the first value appname and then args.
const normalizedArgv =
  String(process.argv[0]).indexOf(pkg.name) >= 0 ? ['node', pkg.name, ...process.argv.slice(1)] : process.argv;
if (normalizedArgv.length > 1) {
  program.parse(normalizedArgv);
}

const cnc = () =>
  new Promise((resolve, reject) => {
    // Change working directory to 'app' before require('./app')
    process.chdir(path.resolve(__dirname, 'app'));

    require('./app').createServer(
      {
        accessTokenLifetime: program.accessTokenLifetime,
        allowRemoteAccess: Boolean(program.allowRemoteAccess),
        backlog: program.backlog,
        configFile: program.config,
        controller: program.controller,
        host: program.host,
        mountPoints: program.mount,
        port: program.port,
        verbosity: program.verbose,
        watchDirectory: program.watchDirectory,
      },
      (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(data);
      }
    );
  });

export default cnc;
