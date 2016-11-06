import tempMonitor from './tempMonitor';
import tempControl from './tempControl';
import feederControl from './feederControl';
import lights from './lights';
import pump from './pump';
import ventilation from './ventilation';

export default function loadRoutes(app) {
  app.use('/tempMonitor', tempMonitor);
  app.use('/tempControl', tempControl);
  app.use('/feederControl', feederControl);
  app.use('/lights', lights);
  app.use('/pump', pump);
  app.use('/ventilation', ventilation);

  return app;
}
