import five from 'johnny-five';
import Edison from 'edison-io';
import express from 'express';

export default function makeRelayRouter(config) {
  const router = express.Router();

  //
  // Edison functions
  //
  const board = new five.Board({
    io: new Edison()
  });

  // So we're going to just use a global variable (it's only global in this file)
  // to store the state for use in requests
  let isOn = config.defaultOn;
  let relay;

  board.on('ready', () => {
    console.log('Initializing relay');
    relay = new five.Relay({
      type: config.relayType,
      pin: config.pin
    });

    setState(isOn);
  });

  function setState(on) {
    isOn = on;
    if (isOn) {
      console.log(`Turning ${config.name} on`);
      relay.on();
    } else {
      console.log(`Turning ${config.name} off`);
      relay.off();
    }
  }

  //
  // Express functions
  //

  router.get('/', (req, res) => {
    res.json({ on: isOn });
  });

  router.post('/on', (req, res) => {
    setState(true);
    res.json({ on: true });
  });

  router.post('/off', (req, res) => {
    setState(false);
    res.json({ on: false });
  });

  return router;
}
