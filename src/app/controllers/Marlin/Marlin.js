import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import set from 'lodash/set';
import events from 'events';

// http://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
function decimalPlaces(num) {
    const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
        return 0;
    }
    return Math.max(
        0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0)
        // Adjust for scientific notation.
        - (match[2] ? +match[2] : 0)
    );
}

class MarlinLineParser {
    parse(line) {
        const parsers = [
            // start
            MarlinLineParserResultStart,

            // FIRMWARE_NAME:Marlin 1.1.0 (Github) SOURCE_CODE_URL:https://github.com/MarlinFirmware/Marlin PROTOCOL_VERSION:1.0 MACHINE_TYPE:RepRap EXTRUDER_COUNT:1 UUID:cede2a2f-41a2-4748-9b12-c55c62f367ff
            MarlinLineParserResultFirmware,

            // X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0
            MarlinLineParserResultPosition,

            // ok
            MarlinLineParserResultOk,

            // echo:
            MarlinLineParserResultEcho,

            // Error:Printer halted. kill() called!
            MarlinLineParserResultError,

            // ok T:293.0 /0.0 B:25.9 /0.0 B@:0 @:0
            MarlinLineParserResultTemperature
        ];

        for (let parser of parsers) {
            const result = parser.parse(line);
            if (result) {
                set(result, 'payload.raw', line);
                return result;
            }
        }

        return {
            type: null,
            payload: {
                raw: line
            }
        };
    }
}

class MarlinLineParserResultStart {
    // start
    static parse(line) {
        const r = line.match(/^start$/);
        if (!r) {
            return null;
        }

        const payload = {};

        return {
            type: MarlinLineParserResultStart,
            payload: payload
        };
    }
}

class MarlinLineParserResultFirmware {
    // FIRMWARE_NAME:Marlin 1.1.0 (Github) SOURCE_CODE_URL:https://github.com/MarlinFirmware/Marlin PROTOCOL_VERSION:1.0 MACHINE_TYPE:RepRap EXTRUDER_COUNT:1 UUID:cede2a2f-41a2-4748-9b12-c55c62f367ff
    static parse(line) {
        let r = line.match(/^FIRMWARE_NAME:.*/i);
        if (!r) {
            return null;
        }

        const payload = {};

        { // FIRMWARE_NAME
            const r = line.match(/FIRMWARE_NAME:([a-zA-Z\_\-]+(\s+[\d\.]+)?)/);
            if (r) {
                payload.firmwareName = r[1];
            }
        }

        { // PROTOCOL_VERSION
            const r = line.match(/PROTOCOL_VERSION:([\d\.]+)/);
            if (r) {
                payload.protocolVersion = r[1];
            }
        }

        { // MACHINE_TYPE
            const r = line.match(/MACHINE_TYPE:(\w+)/);
            if (r) {
                payload.machineType = r[1];
            }
        }

        { // EXTRUDER_COUNT
            const r = line.match(/EXTRUDER_COUNT:(\d+)/);
            if (r) {
                payload.extruderCount = Number(r[1]);
            }
        }

        { // UUID
            const r = line.match(/UUID:([a-zA-Z0-9\-]+)/);
            if (r) {
                payload.uuid = r[1];
            }
        }

        return {
            type: MarlinLineParserResultFirmware,
            payload: payload
        };
    }
}

class MarlinLineParserResultPosition {
    // X:0.00 Y:0.00 Z:0.00 E:0.00 Count X:0 Y:0 Z:0
    static parse(line) {
        const r = line.match(/^(?:(?:X|Y|Z|E):[0-9\.\-]+\s+)+/i);
        if (!r) {
            return null;
        }

        const payload = {
            pos: {}
        };
        const pattern = /((X|Y|Z|E):[0-9\.\-]+)+/gi;
        const params = r[0].match(pattern);

        for (let param of params) {
            const nv = param.match(/^(.+):(.+)/);
            if (nv) {
                const axis = nv[1].toLowerCase();
                const pos = nv[2];
                const digits = decimalPlaces(pos);
                payload.pos[axis] = Number(pos).toFixed(digits);
            }
        }

        return {
            type: MarlinLineParserResultPosition,
            payload: payload
        };
    }
}

class MarlinLineParserResultOk {
    // ok
    static parse(line) {
        const r = line.match(/^ok$/);
        if (!r) {
            return null;
        }

        const payload = {};

        return {
            type: MarlinLineParserResultOk,
            payload: payload
        };
    }
}

class MarlinLineParserResultEcho {
    // echo:
    static parse(line) {
        const r = line.match(/^echo:\s*(.+)$/i);
        if (!r) {
            return null;
        }

        const payload = {
            message: r[1]
        };

        return {
            type: MarlinLineParserResultEcho,
            payload: payload
        };
    }
}

class MarlinLineParserResultError {
    // Error:Printer halted. kill() called!
    static parse(line) {
        const r = line.match(/^Error:\s*(.+)$/i);
        if (!r) {
            return null;
        }

        const payload = {
            message: r[1]
        };

        return {
            type: MarlinLineParserResultError,
            payload: payload
        };
    }
}

class MarlinLineParserResultTemperature {
    // ok T:293.0 /0.0 B:25.9 /0.0 B@:0 @:0
    static parse(line) {
        const r = line.match(/ok (T:[0-9\.\-]+).*(B:[0-9\.\-]+)/i);
        if (!r) {
            return null;
        }

        const payload = {
            temperature: {}
        };

        const params = [r[1], r[2]];
        for (let param of params) {
            const nv = param.match(/^(.+):(.+)/);
            if (nv) {
                const key = nv[1].toLowerCase();
                const value = nv[2];
                const digits = decimalPlaces(value);
                payload.temperature[key] = Number(value).toFixed(digits);
            }
        }
        return {
            type: MarlinLineParserResultTemperature,
            payload: payload
        };
    }
}

class Marlin extends events.EventEmitter {
    state = {
        pos: {
            x: '0.000',
            y: '0.000',
            z: '0.000',
            e: '0.000'
        },
        modal: {
            motion: 'G0', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
            wcs: 'G54', // G54, G55, G56, G57, G58, G59
            plane: 'G17', // G17: xy-plane, G18: xz-plane, G19: yz-plane
            units: 'G21', // G20: Inches, G21: Millimeters
            distance: 'G90', // G90: Absolute, G91: Relative
            feedrate: 'G94', // G93: Inverse time mode, G94: Units per minute
            program: 'M0', // M0, M1, M2, M30
            spindle: 'M5', // M3: Spindle (cw), M4: Spindle (ccw), M5: Spindle off
            coolant: 'M9' // M7: Mist coolant, M8: Flood coolant, M9: Coolant off, [M7,M8]: Both on
        },
        ovF: 100,
        ovS: 100,
        temperature: {
            b: '0.0',
            t: '0.0'
        },
        jogFeedrate: 0, // G0
        feedrate: 0, // G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
        headStatus: 'off', // M3, M4, M5
        headPower: 0
    };
    settings = {
    };

    parser = new MarlinLineParser();

    parse(data) {
        data = ('' + data).replace(/\s+$/, '');
        if (!data) {
            return;
        }

        this.emit('raw', { raw: data });

        const result = this.parser.parse(data) || {};
        const { type, payload } = result;

        if (type === MarlinLineParserResultStart) {
            this.emit('start', payload);
            return;
        }
        if (type === MarlinLineParserResultFirmware) {
            const {
                firmwareName,
                protocolVersion,
                machineType,
                extruderCount,
                uuid
            } = payload;
            const nextSettings = {
                ...this.settings,
                firmwareName,
                protocolVersion,
                machineType,
                extruderCount,
                uuid
            };
            if (!isEqual(this.settings, nextSettings)) {
                this.settings = nextSettings; // enforce change
            }

            this.emit('firmware', payload);
            return;
        }
        if (type === MarlinLineParserResultPosition) {
            const nextState = {
                ...this.state,
                pos: {
                    ...this.state.pos,
                    ...payload.pos
                }
            };

            if (!isEqual(this.state.pos, nextState.pos)) {
                this.state = nextState; // enforce change
            }
            this.emit('pos', payload);
            return;
        }
        if (type === MarlinLineParserResultOk) {
            this.emit('ok', payload);
            return;
        }
        if (type === MarlinLineParserResultError) {
            this.emit('error', payload);
            return;
        }
        if (type === MarlinLineParserResultEcho) {
            this.emit('echo', payload);
            return;
        }
        if (type === MarlinLineParserResultTemperature) {
            const nextState = {
                ...this.state,
                temperature: {
                    ...this.state.temperature,
                    ...payload.temperature
                }
            };
            if (!isEqual(this.state.temperature, nextState.temperature)) {
                this.state = nextState; // enforce change
            }
            this.emit('temperature', payload);
            return;
        }
        if (data.length > 0) {
            this.emit('others', payload);
            return;
        }
    }
    getPosition(state = this.state) {
        return get(state, 'pos', {});
    }
    getModalGroup(state = this.state) {
        return get(state, 'modal', {});
    }
    isAlarm() {
        // Not supported
        return false;
    }
    isIdle() {
        // Not supported
        return false;
    }
}

export {
    MarlinLineParser,
    MarlinLineParserResultStart,
    MarlinLineParserResultFirmware,
    MarlinLineParserResultPosition,
    MarlinLineParserResultOk,
    MarlinLineParserResultEcho,
    MarlinLineParserResultError,
    MarlinLineParserResultTemperature
};
export default Marlin;