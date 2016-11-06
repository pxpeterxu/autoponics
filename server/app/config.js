const development = process.env.DATABASE === 'development';
const file = development ? 'config.local.js' : 'config.prod.js';

const config = require(`./${file}`).default;

export default Object.assign({
  tooHighTemperature: 82,
  tooLowTemperature: 76,
  lcdUpdateThrottle: 1000,  // ms
  logPath: __dirname + '/../logs/log.txt',
  port: 59876
}, config);
