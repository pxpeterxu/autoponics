import five from 'johnny-five';
import Edison from 'edison-io';
import express from 'express';

import { tempMonitor as config } from './config';

const router = express.Router();

//
// Edison functions
//
const board = new five.Board({
  io: new Edison()
});

// So we're going to just use a global variable (it's only global in this file)
// to store the state for use in requests
let temperature = null;

// Plug the LCD module into any of the
// Grove Shield's I2C jacks.
const lcd = new five.LCD({
  controller: 'JHD1313M1'
});

board.on('ready', () => {
  // Plug the TH02 Barometer module
  // into an I2C jack
  const multi = new five.Multi({
    controller: 'TH02'
  });

  let lcdLastUpdate = 0;
  multi.on('change', function() {
    temperature = this.thermometer.fahrenheit;

    const now = Date.now();
    if (Date.now() > lcdLastUpdate + config.lcdUpdateThrottle) {
      lcdLastUpdate = now;
      updateLcd(temperature);
    }
  });
});

function updateLcd(temp) {
  let color = [255, 255, 255];
  if (temp > config.tooHighTemperature) {
    color = [255, 0, 0];
  } else if (temp < config.tooLowTemperature) {
    color = [0, 0, 255];
  }
  const [r, g, b] = color;

  lcd.bgColor(r, g, b)
    .cursor(0, 0).print('Temperature')
    .cursor(1, 0).print(`${temp} F`);
}

//
// Express functions
//

function getTemperatureRoute(req, res) {
  res.json({
    temperature
  });
}

router.get('/', getTemperatureRoute);
router.get('/latest', getTemperatureRoute);

export default router;
