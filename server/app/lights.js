import five from 'johnny-five';
import Edison from 'edison-io';
import express from 'express';

import { lights as config } from './config';

const router = express.Router();

//
// Edison functions
//
const board = new five.Board({
  io: new Edison()
});

// So we're going to just use a global variable (it's only global in this file)
// to store the state for use in requests
let areLightsOn = config.defaultOn;
let relay;

board.on('ready', () => {
  // Plug the lights relay into 6
  relay = new five.Relay({
    type: config.relayType,  // Normally-closed
    pin: config.pin
  });

  setLightState(areLightsOn);
});

function setLightState(on) {
  areLightsOn = on;
  if (areLightsOn) {
    relay.on();
  } else {
    relay.off();
  }
}

//
// Express functions
//

router.get('/', (req, res) => {
  res.json({ on: areLightsOn });
});

router.post('/on', (req, res) => {
  setLightState(true);
  res.json({ on: true });
});

router.post('/off', (req, res) => {
  setLightState(false);
  res.json({ on: false });
});

export default router;
