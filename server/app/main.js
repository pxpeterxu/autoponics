import tempMonitor from './tempMonitor';
import tempControl from './tempControl';
import feederControl from './feederControl';

export default function loadRoutes(app) {
  app.use('/tempMonitor', tempMonitor);
  app.use('/tempControl', tempControl);
  app.use('/feederControl', feederControl);
  return app;
}
