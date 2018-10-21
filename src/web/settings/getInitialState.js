import i18next from 'i18next';

import settings from '../config/settings';

const getInitialState = () => ({
  about: {
    version: {
      checking: false,
      current: settings.version,
      lastUpdate: '',
      latest: settings.version,
    },
  },
  account: {
    api: {
      err: false,
      fetching: false,
    },
    modal: {
      name: '',
      params: {
        alertMessage: '',
        changePassword: false,
      },
    },
    pagination: {
      page: 1,
      pageLength: 100,
      totalRecords: 0,
    },
    records: [],
  },
  commands: {
    api: {
      err: false,
      fetching: false,
    },
    modal: {
      name: '',
      params: {},
    },
    pagination: {
      page: 1,
      pageLength: 100,
      totalRecords: 0,
    },
    records: [],
  },
  controller: {
    api: {
      err: false,
      loading: true,
      saving: false,
    },
    ignoreErrors: false,
  },
  currentSection: 'general',
  events: {
    api: {
      err: false,
      fetching: false,
    },
    modal: {
      name: '',
      params: {},
    },
    pagination: {
      page: 1,
      pageLength: 100,
      totalRecords: 0,
    },
    records: [],
  },
  general: {
    api: {
      err: false,
      loading: true,
      saving: false,
    },
    checkForUpdates: true,
    lang: i18next.language,
  },
  workspace: {
    modal: {
      name: '',
      params: {},
    },
  },
});

export default getInitialState;
