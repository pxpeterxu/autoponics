import tempMonitor from './tempMonitor';
import tempControl from './tempControl';

export default function loadRoutes(app) {
  app.use('/tempMonitor', tempMonitor);
  app.use('/tempControl', tempControl);

  return app;
}
