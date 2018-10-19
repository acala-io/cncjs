import {IMPERIAL_STEPS, METRIC_STEPS} from '../constants';

const defaultState = {
  session: {
    name: '',
    token: '',
  },
  widgets: {
    axes: {
      axes: ['x', 'y', 'z'],
      jog: {
        imperial: {
          distances: [],
          step: IMPERIAL_STEPS.indexOf(1), // Defaults to 1 inch
        },
        keypad: false,
        metric: {
          distances: [],
          step: METRIC_STEPS.indexOf(1), // Defaults to 1 mm
        },
      },
      mdi: {
        disabled: false,
      },
      minimized: false,
      shuttle: {
        feedrateMax: 2000,
        feedrateMin: 500,
        hertz: 10,
        overshoot: 1,
      },
    },
    connection: {
      autoReconnect: true,
      connection: {
        serial: {
          baudRate: 115200,
          path: '',
          rtscts: false, // Hardware flow control (RTS/CTS)
        },
        socket: {
          host: '',
          port: 23,
        },
        type: 'serial', // serial|socket
      },
      controller: {
        type: 'Grbl', // Grbl|Smoothie|TinyG
      },
      minimized: false,
    },
    console: {
      minimized: true,
    },
    custom: {
      disabled: true,
      minimized: false,
      title: '',
      url: '',
    },
    gcode: {
      minimized: false,
    },
    grbl: {
      minimized: false,
      panel: {
        modalGroups: {
          expanded: true,
        },
        queueReports: {
          expanded: true,
        },
        statusReports: {
          expanded: true,
        },
      },
    },
    laser: {
      minimized: false,
      panel: {
        laserTest: {
          expanded: true,
        },
      },
      test: {
        duration: 0,
        maxS: 1000,
        power: 0,
      },
    },
    macro: {
      minimized: false,
    },
    marlin: {
      heater: {
        // Filament          | PLA                | ABS
        // ----------------- | ------------------ | --------------------
        // Uses              | Consumer Products  | Functional Parts
        // Strength          | Medium             | Medium
        // Flexibility       | Low                | Medium
        // Durability        | Medium             | High
        // Print Temperature | 180-230°C          | 210-250°C
        // Bed Temperature   | 20-60°C (optional) | 80-110°C (mandatory)
        extruder: 180,
        heatedBed: 60,
      },
      minimized: false,
      panel: {
        heaterControl: {
          expanded: true,
        },
        modalGroups: {
          expanded: false,
        },
        statusReports: {
          expanded: false,
        },
      },
    },
    probe: {
      minimized: false,
      probeCommand: 'G38.2',
      probeDepth: 10,
      probeFeedrate: 20,
      retractionDistance: 4,
      touchPlateHeight: 10,
      useTLO: false,
    },
    smoothie: {
      minimized: false,
      panel: {
        modalGroups: {
          expanded: true,
        },
        statusReports: {
          expanded: true,
        },
      },
    },
    spindle: {
      minimized: false,
      speed: 1000,
    },
    tinyg: {
      minimized: false,
      panel: {
        modalGroups: {
          expanded: true,
        },
        powerManagement: {
          expanded: false,
        },
        queueReports: {
          expanded: true,
        },
        statusReports: {
          expanded: true,
        },
      },
    },
    visualizer: {
      cameraMode: 'pan', // pan|rotate
      disabled: false,
      gcode: {
        displayName: true,
      },
      minimized: false,
      objects: {
        coordinateSystem: {
          visible: true,
        },
        gridLineNumbers: {
          visible: true,
        },
        toolhead: {
          visible: true,
        },
      },
      projection: 'orthographic', // perspective|orthographic
    },
    webcam: {
      crosshair: false,
      deviceId: '',
      disabled: true,
      geometry: {
        flipHorizontally: false,
        flipVertically: false,
        rotation: 0, // 0: 0, 1: 90, 2: 180, 3: 270
        scale: 1.0,
      },
      mediaSource: 'local', // local (built-in camera or connected webcam)|mjpeg (M-JPEG stream over HTTP)
      minimized: true,
      muted: false,
      url: '', // required for M-JPEG streams
    },
  },
  workspace: {
    container: {
      default: {
        widgets: ['visualizer'],
      },
      primary: {
        show: true,
        widgets: ['connection', 'grbl', 'marlin', 'smoothie', 'tinyg', 'spindle', 'laser', 'console', 'webcam'],
      },
      secondary: {
        show: true,
        widgets: ['axes', 'macro', 'probe', 'gcode'],
      },
    },
  },
};

export default defaultState;
