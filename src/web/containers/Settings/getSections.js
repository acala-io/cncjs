/* eslint-disable react/display-name */

import React from 'react';
import i18n from '../../lib/i18n';

import About from './About';
import Account from './Account';
import Commands from './Commands';
import Controller from './Controller';
import Events from './Events';
import General from './General';
import Workspace from './Workspace';

const getSections = () => [
  {
    component: props => <General {...props} />,
    id: 'general',
    path: 'general',
    title: i18n._('General'),
  },
  {
    component: props => <Workspace {...props} />,
    id: 'workspace',
    path: 'workspace',
    title: i18n._('Workspace'),
  },
  {
    component: props => <Controller {...props} />,
    id: 'controller',
    path: 'controller',
    title: i18n._('Controller'),
  },
  {
    component: props => <Account {...props} />,
    id: 'account',
    path: 'account',
    title: i18n._('My Account'),
  },
  {
    component: props => <Commands {...props} />,
    id: 'commands',
    path: 'commands',
    title: i18n._('Commands'),
  },
  {
    component: props => <Events {...props} />,
    id: 'events',
    path: 'events',
    title: i18n._('Events'),
  },
  {
    component: props => <About {...props} />,
    id: 'about',
    path: 'about',
    title: i18n._('About'),
  },
];

export default getSections;
