import five from 'johnny-five';
import Edison from 'edison-io';
import express from 'express';

export default function makeRelayRouter(config, defaultState, onReady) {
  const router = express.Router();

  //
  // Edison functions
  //
  const board = new five.Board({
    io: new Edison()
  });

  // So we're going to just use a global variable (it's only global in this file)
  // to store the state for use in requests
  let isOn = defaultState != null ? defaultState : config.defaultOn;
  let relay;

  board.on('ready', () => {
    relay = new five.Relay({
      type: config.relayType,
      pin: config.pin
    });

    setState(isOn);

    if (onReady) onReady(setState);
  });

  function setState(on) {
    isOn = on;
    if (isOn) {
      relay.on();
    } else {
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

  router.relay = relay;
  router.setState = setState;  // Expose the setState function for other uses

  return router;
}
