import express from 'express';
import tempMonitor from './tempMonitor';

export default function loadRoutes(app) {
  app.use('/tempMonitor', tempMonitor);

  return app;
}
