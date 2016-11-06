import winston from 'winston';
import config from '../config';  // eslint-disable-line import/no-unresolved

console.log(config);

function createLogger(logPath) {
  return new winston.Logger({
    transports: [
      new (winston.transports.Console)(),
      new winston.transports.File({ filename: logPath }),
    ]
  });
}

function createFileOnlyLogger(logPath) {  // eslint-disable-line no-unused-vars
  return new winston.Logger({
    transports: [
      new winston.transports.File({ filename: logPath }),
    ]
  });
}

const logger = createLogger(config.logPath);

export default logger;
