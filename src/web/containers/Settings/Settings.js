/* eslint-disable react/forbid-foreign-prop-types */

import i18next from 'i18next';
import React, {PureComponent} from 'react';
import Uri from 'jsuri';
import {camelCase, find, findIndex, get, isEqual} from 'lodash';
import {withRouter} from 'react-router-dom';

import api from '../../api';
import i18n from '../../lib/i18n';

import getInitialState from './getInitialState';
import getSections from './getSections';
import {ERR_CONFLICT, ERR_PRECONDITION_FAILED} from '../../api/constants';

import Flexbox from '../../components_new/Flexbox';
import {Nav, NavItem} from './Nav';

import './index.scss';

const mapSectionPathToId = (path = '') => {
  return camelCase(path.split('/')[0] || '');
};

class Settings extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
  };

  initialState = getInitialState();

  state = getInitialState();

  sections = null;

  render() {
    const state = {
      ...this.state,
    };
    const actions = {
      ...this.actions,
    };

    // respective Section component
    const {component, id} = this.activeSection;
    const Section = component;
    const sectionInitialState = this.initialState[id];
    const sectionState = state[id];
    const sectionStateChanged = !isEqual(sectionInitialState, sectionState);
    const sectionActions = actions[id];

    return (
      <Flexbox flexDirection="row">
        <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1}>
          {this.nav}
        </Flexbox>
        <Flexbox flexBasis="auto" flexGrow={5} flexShrink={1}>
          <Section
            initialState={sectionInitialState}
            state={sectionState}
            stateChanged={sectionStateChanged}
            actions={sectionActions}
          />
        </Flexbox>
      </Flexbox>
    );
  }

  get nav() {
    const activeSectionId = this.activeSection.id;

    return (
      <Nav>
        {this.sections.map(section => (
          <NavItem
            key={section.id}
            path={section.path}
            title={section.title}
            isActive={activeSectionId === section.id}
          />
        ))}
      </Nav>
    );
  }

  get activeSection() {
    const {pathname = ''} = this.props.location;
    const initialSectionPath = this.sections[0].path;
    const sectionPath = pathname.replace(/^\/settings(\/)?/, ''); // TODO
    const id = mapSectionPathToId(sectionPath || initialSectionPath);
    const activeSection = find(this.sections, {id}) || this.sections[0];

    return activeSection;
  }

  actions = {
    general: {
      load: () => {
        this.setState({
          general: {
            ...this.state.general,
            api: {
              ...this.state.general.api,
              err: false,
              loading: true,
            },
          },
        });

        api
          .getState()
          .then(res => {
            const {checkForUpdates} = {...res.body};

            const nextState = {
              ...this.state.general,
              api: {
                ...this.state.general.api,
                err: false,
                loading: false,
              },
              checkForUpdates: Boolean(checkForUpdates),
              lang: i18next.language,
            };

            this.initialState.general = nextState;

            this.setState({general: nextState});
          })
          .catch(() => {
            this.setState({
              general: {
                ...this.state.general,
                api: {
                  ...this.state.general.api,
                  err: true,
                  loading: false,
                },
              },
            });
          });
      },
      save: () => {
        const {lang = 'en'} = this.state.general;

        this.setState({
          general: {
            ...this.state.general,
            api: {
              ...this.state.general.api,
              err: false,
              saving: true,
            },
          },
        });

        const data = {
          checkForUpdates: this.state.general.checkForUpdates,
        };

        api
          .setState(data)
          .then(() => {
            const nextState = {
              ...this.state.general,
              api: {
                ...this.state.general.api,
                err: false,
                saving: false,
              },
            };

            // Update settings to initialState
            this.initialState.general = nextState;

            this.setState({general: nextState});
          })
          .catch(() => {
            this.setState({
              general: {
                ...this.state.general,
                api: {
                  ...this.state.general.api,
                  err: true,
                  saving: false,
                },
              },
            });
          })
          .then(() => {
            if (lang === i18next.language) {
              return;
            }

            i18next.changeLanguage(lang, () => {
              const uri = new Uri(window.location.search);
              uri.replaceQueryParam('lang', lang);
              window.location.search = uri.toString();
            });
          });
      },
      restoreSettings: () => {
        // Restore settings from initialState
        this.setState({
          general: this.initialState.general,
        });
      },
      toggleCheckForUpdates: () => {
        const {checkForUpdates} = this.state.general;
        this.setState({
          general: {
            ...this.state.general,
            checkForUpdates: !checkForUpdates,
          },
        });
      },
      changeLanguage: lang => {
        this.setState({
          general: {
            ...this.state.general,
            lang,
          },
        });
      },
    },
    workspace: {
      openModal: (name = '', params = {}) => {
        this.setState({
          workspace: {
            ...this.state.workspace,
            modal: {
              name,
              params,
            },
          },
        });
      },
      closeModal: () => {
        this.setState({
          workspace: {
            ...this.state.workspace,
            modal: {
              name: '',
              params: {},
            },
          },
        });
      },
    },
    controller: {
      load: () => {
        this.setState(state => ({
          controller: {
            ...state.controller,
            api: {
              ...state.controller.api,
              err: false,
              loading: true,
            },
          },
        }));

        api
          .getState()
          .then(res => {
            const ignoreErrors = get(res.body, 'controller.exception.ignoreErrors');

            const nextState = {
              ...this.state.controller,
              api: {
                ...this.state.controller.api,
                err: false,
                loading: false,
              },
              // data
              ignoreErrors: Boolean(ignoreErrors),
            };

            this.initialState.controller = nextState;

            this.setState({controller: nextState});
          })
          .catch(() => {
            this.setState(state => ({
              controller: {
                ...state.controller,
                api: {
                  ...state.controller.api,
                  err: true,
                  loading: false,
                },
              },
            }));
          });
      },
      save: () => {
        this.setState(state => ({
          controller: {
            ...state.controller,
            api: {
              ...state.controller.api,
              err: false,
              saving: true,
            },
          },
        }));

        const data = {
          controller: {
            exception: {
              ignoreErrors: this.state.controller.ignoreErrors,
            },
          },
        };

        api
          .setState(data)
          .then(() => {
            const nextState = {
              ...this.state.controller,
              api: {
                ...this.state.controller.api,
                err: false,
                saving: false,
              },
            };

            // Update settings to initialState
            this.initialState.controller = nextState;

            this.setState({controller: nextState});
          })
          .catch(() => {
            this.setState(state => ({
              controller: {
                ...state.controller,
                api: {
                  ...state.controller.api,
                  err: true,
                  saving: false,
                },
              },
            }));
          });
      },
      restoreSettings: () => {
        // Restore settings from initialState
        this.setState({
          controller: this.initialState.controller,
        });
      },
      toggleIgnoreErrors: () => {
        this.setState(state => ({
          controller: {
            ...state.controller,
            ignoreErrors: !state.controller.ignoreErrors,
          },
        }));
      },
    },
    account: {
      fetchRecords: options => {
        const state = this.state.account;
        const {page = state.pagination.page, pageLength = state.pagination.pageLength} = {...options};

        this.setState({
          account: {
            ...this.state.account,
            api: {
              ...this.state.account.api,
              err: false,
              fetching: true,
            },
          },
        });

        api.users
          .fetch({page, paging: true, pageLength})
          .then(res => {
            const {pagination, records} = res.body;

            this.setState({
              account: {
                ...this.state.account,
                api: {
                  ...this.state.account.api,
                  err: false,
                  fetching: false,
                },
                pagination: {
                  page: pagination.page,
                  pageLength: pagination.pageLength,
                  totalRecords: pagination.totalRecords,
                },
                records,
              },
            });
          })
          .catch(() => {
            this.setState({
              account: {
                ...this.state.account,
                api: {
                  ...this.state.account.api,
                  err: true,
                  fetching: false,
                },
                records: [],
              },
            });
          });
      },
      createRecord: options => {
        const actions = this.actions.account;

        api.users
          .create(options)
          .then(() => {
            actions.closeModal();
            actions.fetchRecords();
          })
          .catch(res => {
            const fallbackMsg = i18n._('An unexpected error has occurred.');
            const msg =
              {
                [ERR_CONFLICT]: i18n._('The account name is already being used. Choose another name.'),
              }[res.status] || fallbackMsg;

            actions.updateModalParams({alertMessage: msg});
          });
      },
      updateRecord: (id, options, forceReload = false) => {
        const actions = this.actions.account;

        api.users
          .update(id, options)
          .then(() => {
            actions.closeModal();

            if (forceReload) {
              actions.fetchRecords();
              return;
            }

            const records = this.state.account.records;
            const index = findIndex(records, {id});

            if (index >= 0) {
              records[index] = {
                ...records[index],
                ...options,
              };

              this.setState({
                account: {
                  ...this.state.account,
                  records,
                },
              });
            }
          })
          .catch(res => {
            const fallbackMsg = i18n._('An unexpected error has occurred.');
            const msg =
              {
                [ERR_CONFLICT]: i18n._('The account name is already being used. Choose another name.'),
                [ERR_PRECONDITION_FAILED]: i18n._('Passwords do not match.'),
              }[res.status] || fallbackMsg;

            actions.updateModalParams({alertMessage: msg});
          });
      },
      deleteRecord: id => {
        const actions = this.actions.account;

        api.users
          .delete(id)
          .then(() => {
            actions.fetchRecords();
          })
          .catch(() => {
            // Ignore error
          });
      },
      openModal: (name = '', params = {}) => {
        this.setState({
          account: {
            ...this.state.account,
            modal: {
              name,
              params,
            },
          },
        });
      },
      closeModal: () => {
        this.setState({
          account: {
            ...this.state.account,
            modal: {
              name: '',
              params: {},
            },
          },
        });
      },
      updateModalParams: (params = {}) => {
        this.setState({
          account: {
            ...this.state.account,
            modal: {
              ...this.state.account.modal,
              params: {
                ...this.state.account.modal.params,
                ...params,
              },
            },
          },
        });
      },
    },
    commands: {
      fetchRecords: options => {
        const state = this.state.commands;
        const {page = state.pagination.page, pageLength = state.pagination.pageLength} = {...options};

        this.setState({
          commands: {
            ...this.state.commands,
            api: {
              ...this.state.commands.api,
              err: false,
              fetching: true,
            },
          },
        });

        api.commands
          .fetch({page, paging: true, pageLength})
          .then(res => {
            const {pagination, records} = res.body;

            this.setState({
              commands: {
                ...this.state.commands,
                api: {
                  ...this.state.commands.api,
                  err: false,
                  fetching: false,
                },
                pagination: {
                  page: pagination.page,
                  pageLength: pagination.pageLength,
                  totalRecords: pagination.totalRecords,
                },
                records,
              },
            });
          })
          .catch(() => {
            this.setState({
              commands: {
                ...this.state.commands,
                api: {
                  ...this.state.commands.api,
                  err: true,
                  fetching: false,
                },
                records: [],
              },
            });
          });
      },
      createRecord: options => {
        const actions = this.actions.commands;

        api.commands
          .create(options)
          .then(() => {
            actions.closeModal();
            actions.fetchRecords();
          })
          .catch(res => {
            const fallbackMsg = i18n._('An unexpected error has occurred.');
            const msg =
              {
                // TODO
              }[res.status] || fallbackMsg;

            actions.updateModalParams({alertMessage: msg});
          });
      },
      updateRecord: (id, options, forceReload = false) => {
        const actions = this.actions.commands;

        api.commands
          .update(id, options)
          .then(() => {
            actions.closeModal();

            if (forceReload) {
              actions.fetchRecords();
              return;
            }

            const records = this.state.commands.records;
            const index = findIndex(records, {id});

            if (index >= 0) {
              records[index] = {
                ...records[index],
                ...options,
              };

              this.setState({
                commands: {
                  ...this.state.commands,
                  records,
                },
              });
            }
          })
          .catch(res => {
            const fallbackMsg = i18n._('An unexpected error has occurred.');
            const msg =
              {
                // TODO
              }[res.status] || fallbackMsg;

            actions.updateModalParams({alertMessage: msg});
          });
      },
      deleteRecord: id => {
        const actions = this.actions.commands;

        api.commands
          .delete(id)
          .then(() => {
            actions.fetchRecords();
          })
          .catch(() => {
            // Ignore error
          });
      },
      openModal: (name = '', params = {}) => {
        this.setState({
          commands: {
            ...this.state.commands,
            modal: {
              name,
              params,
            },
          },
        });
      },
      closeModal: () => {
        this.setState({
          commands: {
            ...this.state.commands,
            modal: {
              name: '',
              params: {},
            },
          },
        });
      },
      updateModalParams: (params = {}) => {
        this.setState({
          commands: {
            ...this.state.commands,
            modal: {
              ...this.state.commands.modal,
              params: {
                ...this.state.commands.modal.params,
                ...params,
              },
            },
          },
        });
      },
    },
    events: {
      fetchRecords: options => {
        const state = this.state.events;
        const {page = state.pagination.page, pageLength = state.pagination.pageLength} = {...options};

        this.setState({
          events: {
            ...this.state.events,
            api: {
              ...this.state.events.api,
              err: false,
              fetching: true,
            },
          },
        });

        api.events
          .fetch({page, paging: true, pageLength})
          .then(res => {
            const {pagination, records} = res.body;

            this.setState({
              events: {
                ...this.state.events,
                api: {
                  ...this.state.events.api,
                  err: false,
                  fetching: false,
                },
                pagination: {
                  page: pagination.page,
                  pageLength: pagination.pageLength,
                  totalRecords: pagination.totalRecords,
                },
                records,
              },
            });
          })
          .catch(() => {
            this.setState({
              events: {
                ...this.state.events,
                api: {
                  ...this.state.events.api,
                  err: true,
                  fetching: false,
                },
                records: [],
              },
            });
          });
      },
      createRecord: options => {
        const actions = this.actions.events;

        api.events
          .create(options)
          .then(() => {
            actions.closeModal();
            actions.fetchRecords();
          })
          .catch(res => {
            const fallbackMsg = i18n._('An unexpected error has occurred.');
            const msg =
              {
                // TODO
              }[res.status] || fallbackMsg;

            actions.updateModalParams({alertMessage: msg});
          });
      },
      updateRecord: (id, options, forceReload = false) => {
        const actions = this.actions.events;

        api.events
          .update(id, options)
          .then(() => {
            actions.closeModal();

            if (forceReload) {
              actions.fetchRecords();
              return;
            }

            const records = this.state.events.records;
            const index = findIndex(records, {id});

            if (index >= 0) {
              records[index] = {
                ...records[index],
                ...options,
              };

              this.setState({
                events: {
                  ...this.state.events,
                  records,
                },
              });
            }
          })
          .catch(res => {
            const fallbackMsg = i18n._('An unexpected error has occurred.');
            const msg =
              {
                // TODO
              }[res.status] || fallbackMsg;

            actions.updateModalParams({alertMessage: msg});
          });
      },
      deleteRecord: id => {
        const actions = this.actions.events;

        api.events
          .delete(id)
          .then(() => {
            actions.fetchRecords();
          })
          .catch(() => {
            // Ignore error
          });
      },
      openModal: (name = '', params = {}) => {
        this.setState({
          events: {
            ...this.state.events,
            modal: {
              name,
              params,
            },
          },
        });
      },
      closeModal: () => {
        this.setState({
          events: {
            ...this.state.events,
            modal: {
              name: '',
              params: {},
            },
          },
        });
      },
      updateModalParams: (params = {}) => {
        this.setState({
          events: {
            ...this.state.events,
            modal: {
              ...this.state.events.modal,
              params: {
                ...this.state.events.modal.params,
                ...params,
              },
            },
          },
        });
      },
    },
    about: {
      checkLatestVersion: () => {
        this.setState({
          about: {
            ...this.state.about,
            version: {
              ...this.state.about.version,
              checking: true,
            },
          },
        });

        api
          .getLatestVersion()
          .then(res => {
            if (!this.mounted) {
              return;
            }

            const {time, version} = res.body;

            this.setState({
              about: {
                ...this.state.about,
                version: {
                  ...this.state.about.version,
                  checking: false,
                  lastUpdate: time,
                  latest: version,
                },
              },
            });
          })
          .catch(() => {
            // Ignore error
          });
      },
    },
  };

  UNSAFE_componentWillMount() {
    this.sections = getSections();
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }
}

export default withRouter(Settings);
