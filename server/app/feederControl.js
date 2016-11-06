import five from 'johnny-five';
import Edison from 'edison-io';
import express from 'express';

import { feederControl as config } from './config';

const router = express.Router();

let servo = null;

//
// Edison functions
//
const board = new five.Board({
  io: new Edison()
});

board.on('ready', () => {
  console.log(config.pin);
  servo = new five.Servo(config.pin);
  servo.to(config.loadAngle);
});

function feedFish(req, res) {
  servo.to(config.dispenseAngle);
  setTimeout(() => {
    servo.to(config.loadAngle);
    res.json({ success: true });
  }, 500);
}

//
// Express functions
//

router.post('/feed', feedFish);
router.get('/feed', feedFish);
export default router;
