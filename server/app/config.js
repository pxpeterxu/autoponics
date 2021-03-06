const development = process.env.DATABASE === 'development';
const file = development ? 'config.local.js' : 'config.prod.js';

const config = require(`./${file}`).default;

export const tempMonitor = {
  tooHighTemperature: 82,
  tooLowTemperature: 76,
  lcdUpdateThrottle: 1000,  // ms
};

export const tempControl = {
  pin: 5,
  minTemperature: 68,
  maxTemperature: 85,
  defaultTemperature: 79
};

export const feederControl = {
  pin: 6,
  loadAngle: 180,
  dispenseAngle: 0
};

export const lights = {
  relayType: 'NO',
  pin: 7,
  defaultOn: false,
  defaultOnAt: 7,
  defaultOffAt: 18
};

export const pump = {
  relayType: 'NO',
  pin: 8,
  defaultOn: false
};

export const ventilation = {
  relayType: 'NO',
  pin: 4,
  defaultOn: true
};

export default Object.assign({
  tempMonitor,
  tempControl,
  feederControl,
  lights,
  pump,
  ventilation,
  logPath: __dirname + '/../logs/log.txt',
  port: 59876
}, config);
