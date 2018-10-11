import Commands from './Commands';
import Controllers from './Controllers';
import Events from './Events';
import Macros from './Macros';
import MDI from './MDI';
import Users from './Users';
import {getLatestVersion} from './Version';
import Watch from './Watch';
import {downloadGCode, fetchGCode, loadGCode} from './GCode';
import {getState, setState, unsetState} from './State';
import {signin} from './Authentication';

export default {
  commands: Commands,
  controllers: Controllers,
  downloadGCode,
  events: Events,
  fetchGCode,
  getLatestVersion,
  getState,
  loadGCode,
  macros: Macros,
  mdi: MDI,
  setState,
  signin,
  unsetState,
  users: Users,
  watch: Watch,
};
