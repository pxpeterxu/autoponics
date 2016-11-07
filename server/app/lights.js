import moment from 'moment';
import sourcemap from 'source-map-support';

import makeRelayRouter from './libs/makeRelayRouter';
import { lights as config } from './config';

sourcemap.install();

let onAt = config.defaultOnAt;
let offAt = config.defaultOffAt;

function getMostRecentHourInPast(hour, now) {
  now = now || moment();

  const mostRecent = now.clone().startOf('day').hour(onAt);
  if (mostRecent.isAfter(now)) {
    mostRecent.subtract(1, 'day');
  }

  return mostRecent;
}

let lastScheduledState = null;

// See which one is more recent: onAt or offAt
function getScheduledState() {
  const now = moment();
  const mostRecentOn = +getMostRecentHourInPast(onAt, now);
  const mostRecentOff = +getMostRecentHourInPast(offAt, now);

  const timeSinceOn = +now - mostRecentOn;
  const timeSinceOff = +now - mostRecentOff;

  return timeSinceOn < timeSinceOff;
}

function setStateWithSchedule(setState, force) {
  const newState = getScheduledState();
  console.log('Checking scheduled light state');
  console.log(`Current: ${lastScheduledState}`);
  console.log(`Next: ${newState}`);
  if (lastScheduledState === null || lastScheduledState !== newState || force) {
    console.log('Changing lights state');
    lastScheduledState = newState;
    setState(newState);
  } else {
    console.log('No lights state change needed');
  }
}

function setStateWithScheduleLoop(setState) {
  setStateWithSchedule(setState);
  setTimeout(setStateWithScheduleLoop.bind(null, setState), 1000);
}

const router = makeRelayRouter(config, getScheduledState(), setStateWithScheduleLoop);
router.post('/lights/schedule', (req, res) => {
  const newOnAt = parseInt(req.body.onAt, 10);
  const newOffAt = parseInt(req.body.offAt, 10);

  if (isNaN(newOnAt) || isNaN(newOffAt)) {
    res.json({
      success: false,
      message: 'Invalid parameters'
    });
    return;
  }

  onAt = newOnAt;
  offAt = newOffAt;

  // Update based on the new schedule
  setStateWithSchedule(router.setState, true);

  res.json({ success: true, onAt, offAt });
});

router.get('/lights/schedule', (req, res) => {
  res.json({ onAt, offAt });
});

export default router;
