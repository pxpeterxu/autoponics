import tempMonitor from './tempMonitor';
import tempControl from './tempControl';
import lights from './lights';

export default function loadRoutes(app) {
  app.use('/tempMonitor', tempMonitor);
  app.use('/tempControl', tempControl);
  app.use('/lights', lights);

  return app;
}
