/* eslint-disable import/default, import/no-dynamic-require */

import chainedFunction from 'chained-function';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment';
import pubsub from 'pubsub-js';
import qs from 'qs';
import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import XHR from 'i18next-xhr-backend';
import {HashRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {TRACE, DEBUG, INFO, WARN, ERROR} from 'universal-logger';

import controller from './lib/controller';
import i18n from './lib/i18n';
import log from './lib/log';
import portal from './lib/portal';
import promisify from './lib/promisify';
import series from './lib/promise-series';
import user from './lib/user';

import defaultState from './store_old/defaultState';
import store_old from './store_old';
import store from './store';

import settings from './config/settings';

import Anchor from './components/Anchor';
import App from './containers/App';
import Login from './containers/Login';
import Modal from './components/Modal';
import ModalTemplate from './components/ModalTemplate';
import ProtectedRoute from './components/ProtectedRoute';
import Space from './components/Space';
import {Button} from './components/Buttons';

import './scss/app.scss';

const renderPage = () => {
  const app = (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Route path="/login" component={Login} />
          <ProtectedRoute path="/" component={App} />
        </Fragment>
      </Router>
    </Provider>
  );

  ReactDOM.render(app, document.getElementById('app'));
};

series([
  () => {
    const obj = qs.parse(window.location.search.slice(1));
    const level = {
      trace: TRACE,
      debug: DEBUG,
      info: INFO,
      warn: WARN,
      error: ERROR,
    }[obj.log_level || settings.log.level];
    log.setLevel(level);
  },
  () =>
    promisify(next => {
      i18next
        .use(XHR)
        .use(LanguageDetector)
        .init(settings.i18next, () => {
          next();
        });
    })(),
  () =>
    promisify(next => {
      const locale = i18next.language;
      if (locale === 'en') {
        next();
        return;
      }

      require(`bundle-loader!moment/locale/${locale}`)(() => {
        log.debug(`moment: locale=${locale}`);
        moment().locale(locale);
        next();
      });
    })(),
  () =>
    promisify(next => {
      const sessionToken = store_old.get('session.token');

      user.signin({token: sessionToken}).then(({authenticated, token}) => {
        if (authenticated) {
          log.debug('Create and establish a WebSocket connection');

          const host = '';
          const options = {
            query: `token=${token}`,
          };
          controller.connect(
            host,
            options,
            () => {
              // @see "src/web/containers/Login/Login.js"
              next();
            }
          );
          return;
        }
        next();
      });
    })(),
])
  .then(async () => {
    log.info(`${settings.productName} ${settings.version}`);

    // Cross-origin communication
    window.addEventListener(
      'message',
      event => {
        // TODO: event.origin

        const {action, token = ''} = {...event.data};

        // Token authentication
        if (token !== store_old.get('session.token')) {
          log.warn(`Received a message with an unauthorized token (${token}).`);
          return;
        }

        const {payload, type} = {...action};

        if (type === 'connect') {
          pubsub.publish('message:connect', payload);
        } else if (type === 'resize') {
          pubsub.publish('message:resize', payload);
        } else {
          log.warn(`No valid action type (${type}) specified in the message.`);
        }
      },
      false
    );

    // Prevent browser from loading a drag-and-dropped file
    // @see http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    window.addEventListener(
      'dragover',
      e => {
        e.preventDefault();
      },
      false
    );

    window.addEventListener(
      'drop',
      e => {
        e.preventDefault();
      },
      false
    );

    // Hide loading state
    const loading = document.getElementById('loading');
    if (loading) {
      loading.remove();
    }

    if (settings.error.corruptedWorkspaceSettings) {
      const filename = `${settings.name}-${settings.version}.json`;
      const text = store_old.getConfig();
      const url = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;

      await portal(({onClose}) => (
        <Modal onClose={onClose} disableOverlay showCloseButton={false}>
          <Modal.Body>
            <ModalTemplate type="error">
              <h5>{i18n._('Corrupted workspace settings')}</h5>
              <p>
                {i18n._(
                  'The workspace settings have become corrupted or invalid. Click store_old Defaults to store_old default settings and continue.'
                )}
              </p>
              <div>
                <Anchor href={url} download={filename}>
                  <i className="fa fa-download" />
                  <Space width="4" />
                  {i18n._('Download workspace settings')}
                </Anchor>
              </div>
            </ModalTemplate>
          </Modal.Body>
          <Modal.Footer>
            <Button
              btnStyle="danger"
              onClick={chainedFunction(() => {
                // Reset to default state
                store_old.state = defaultState;

                // Persist data locally
                store_old.persist();
              }, onClose)}
            >
              {i18n._('store Defaults')}
            </Button>
          </Modal.Footer>
        </Modal>
      ));
    }

    renderPage();

    // Enable React Developer Tools
    window.React = React;
  })
  .catch(err => {
    log.error(err);
  });
