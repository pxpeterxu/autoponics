import five from 'johnny-five';
import Edison from 'edison-io';
import express from 'express';

import { tempControl as config } from './config';

const router = express.Router();

let servo = null;

//
// Edison functions
//
const board = new five.Board({
  io: new Edison()
});

board.on('ready', () => {
  servo = new five.Servo(config.pin);
  setTemperature(config.defaultTemperature);
});

function setTemperature(temp) {
  let angle;
  // 180 is the lowest temperature, 0 is the highest
  if (temp < config.minTemperature) {
    angle = 180;
  } else if (temp > config.maxTemperature) {
    angle = 0;
  } else {
    angle = Math.round((config.maxTemperature - temp) / (config.maxTemperature - config.minTemperature) * 180);
  }

  servo.to(angle);
  return angle;
}

//
// Express functions
//

router.get('/set/:temperature', (req, res) => {
  const temperature = req.params.temperature;
  const angle = setTemperature(temperature);

  res.json({
    angle,
    temperature
  });
});

export default router;
