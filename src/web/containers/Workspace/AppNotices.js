import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import Push from 'push.js';
import React, {PureComponent} from 'react';
import semver from 'semver';
import {without} from 'lodash';

import api from '../../api';

import pkg from '../../../../package.json';

import {InfoBar} from '../../components_new/NotificationBar';

class AppNotices extends PureComponent {
  _isMounted = false;

  state = this.getInitialState();

  getInitialState() {
    // let pushPermission = '';
    // try {
    //   // Push.Permission.get() will throw an error if Push is not supported on this device
    //   pushPermission = Push.Permission.get();
    // } catch (e) {
    //   // Ignore
    // }

    return {
      commands: [],
      currentVersion: pkg.version,
      latestVersion: pkg.version,
      // pushPermission,
      runningTasks: [],
    };
  }

  render() {
    const {currentVersion, latestVersion} = this.state;

    const newUpdateAvailable = semver.lt(currentVersion, latestVersion);
    // const showCommands = commands.length > 0;

    if (newUpdateAvailable) {
      return <InfoBar>{i18n._('New update available')}</InfoBar>;
    }

    return null;

    // TODO: Move logout somewhere

    // <MenuItem header>{i18n._('Signed in as {{name}}', {name: signedInName})}</MenuItem>
    // <MenuItem divider />
    // <MenuItem href="#/settings/account">
    //   <i className="fa fa-fw fa-user" />
    //   <Space width="8" />
    //   {i18n._('Account')}
    // </MenuItem>
    // <MenuItem
    //   onClick={() => {
    //     if (user.authenticated()) {
    //       log.debug('Destroy and cleanup the WebSocket connection');
    //       controller.disconnect();

    //       user.signout();

    //       // Remember current location
    //       history.replace(location.pathname);
    //     }
    //   }}
    // >

    // TODO: Move commands functionality somewhere

    // {showCommands && (
    //   <div>
    //     {i18n._('Command')}
    //     {pushPermission === Push.Permission.GRANTED && (
    //       <span className="pull-right">
    //         <i className="fa fa-fw fa-bell-o" />
    //       </span>
    //     )}
    //     {pushPermission === Push.Permission.DENIED && (
    //       <span className="pull-right">
    //         <i className="fa fa-fw fa-bell-slash-o" />
    //       </span>
    //     )}
    //     {pushPermission === Push.Permission.DEFAULT && (
    //       <span className="pull-right">
    //         <div
    //           className="btn-icon"
    //           onClick={this.actions.requestPushPermission}
    //           title={i18n._('Show notifications')}
    //         >
    //           <i className="fa fa-fw fa-bell" />
    //         </div>
    //       </span>
    //     )}
    //   </div>
    // )}
    // {showCommands &&
    //   commands.map(cmd => {
    //     const isTaskRunning = runningTasks.indexOf(cmd.taskId) >= 0;

    //     return (
    //       <MenuItem
    //         key={cmd.id}
    //         disabled={cmd.disabled}
    //         onSelect={() => {
    //           this.actions.runCommand(cmd);
    //         }}
    //       >
    //         <span title={cmd.command}>{cmd.title || cmd.command}</span>
    //         <span className="pull-right">
    //           <i
    //             className={classcat([
    //               'fa fa-fw',
    //               {
    //                 'fa-circle-o-notch fa-spin': isTaskRunning,
    //                 'text-error fa-exclamation-circle': cmd.err,
    //               },
    //             ])}
    //             title={cmd.err}
    //           />
    //         </span>
    //       </MenuItem>
    //     );
    //   })}
  }

  actions = {
    checkForUpdates: async () => {
      try {
        const res = await api.getState();
        const {checkForUpdates} = res.body;

        if (checkForUpdates) {
          const res = await api.getLatestVersion();
          const {time, version} = res.body;

          if (this._isMounted) {
            this.setState({
              latestTime: time,
              latestVersion: version,
            });
          }
        }
      } catch (res) {
        // Ignore error
      }
    },
    fetchCommands: async () => {
      try {
        const res = await api.commands.fetch({paging: false});
        const {records: commands} = res.body;

        if (this._isMounted) {
          this.setState({
            commands: commands.filter(command => command.enabled),
          });
        }
      } catch (res) {
        // Ignore error
      }
    },
    requestPushPermission: () => {
      const onGranted = () => {
        this.setState({
          pushPermission: Push.Permission.GRANTED,
        });
      };

      const onDenied = () => {
        this.setState({
          pushPermission: Push.Permission.DENIED,
        });
      };

      // Note that if "Permission.DEFAULT" is returned, no callback is executed
      const permission = Push.Permission.request(onGranted, onDenied);
      if (permission === Push.Permission.DEFAULT) {
        this.setState({
          pushPermission: Push.Permission.DEFAULT,
        });
      }
    },
    runCommand: async cmd => {
      try {
        const res = await api.commands.run(cmd.id);
        const {taskId} = res.body;

        this.setState({
          commands: this.state.commands.map(c => {
            return c.id === cmd.id ? {...c, taskId, err: null} : c;
          }),
        });
      } catch (res) {
        // Ignore error
      }
    },
  };

  controllerEvents = {
    'config:change': () => {
      this.actions.fetchCommands();
    },
    'task:start': taskId => {
      this.setState({
        runningTasks: this.state.runningTasks.concat(taskId),
      });
    },
    'task:finish': (taskId, code) => {
      const err = code !== 0 ? new Error(`errno=${code}`) : null;
      let cmd = null;

      this.setState({
        commands: this.state.commands.map(c => {
          if (c.taskId !== taskId) {
            return c;
          }

          cmd = c;

          return {
            ...c,
            err,
            taskId: null,
          };
        }),
        runningTasks: without(this.state.runningTasks, taskId),
      });

      if (cmd && this.state.pushPermission === Push.Permission.GRANTED) {
        Push.create(cmd.title, {
          body: code === 0 ? i18n._('Command succeeded') : i18n._('Command failed ({{err}})', {err}),
          icon: 'images/logo-badge-32x32.png',
          onClick() {
            window.focus();
            this.close();
          },
          timeout: 10 * 1000,
        });
      }
    },
    'task:error': (taskId, err) => {
      let cmd = null;

      this.setState({
        commands: this.state.commands.map(c => {
          if (c.taskId !== taskId) {
            return c;
          }

          cmd = c;

          return {
            ...c,
            err,
            taskId: null,
          };
        }),
        runningTasks: without(this.state.runningTasks, taskId),
      });

      if (cmd && this.state.pushPermission === Push.Permission.GRANTED) {
        Push.create(cmd.title, {
          body: i18n._('Command failed ({{err}})', {err}),
          icon: 'images/logo-badge-32x32.png',
          onClick() {
            window.focus();
            this.close();
          },
          timeout: 10 * 1000,
        });
      }
    },
  };

  componentDidMount() {
    this._isMounted = true;

    // this.addControllerEvents();

    this.actions.checkForUpdates();
    // this.actions.fetchCommands();
  }

  componentWillUnmount() {
    this._isMounted = false;

    // this.removeControllerEvents();

    this.runningTasks = [];
  }

  addControllerEvents() {
    Object.keys(this.controllerEvents).forEach(eventName => {
      controller.addListener(eventName, this.controllerEvents[eventName]);
    });
  }

  removeControllerEvents() {
    Object.keys(this.controllerEvents).forEach(eventName => {
      controller.removeListener(eventName, this.controllerEvents[eventName]);
    });
  }
}

export default AppNotices;
