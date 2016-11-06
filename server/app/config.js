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

export const lights = {
  relayType: 'NO',  // Default on; normally open
  pin: 7,
  defaultOn: false
};

export default Object.assign({
  tempMonitor,
  tempControl,
  lights,
  logPath: __dirname + '/../logs/log.txt',
  port: 59876
}, config);
