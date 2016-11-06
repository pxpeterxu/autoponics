import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from './app/libs/logger';
import routes from './app/main';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_REQUEST_LOG) {
  app.use(morgan('dev', { stream: logger.requestLogger.stream }));
}

app.use(bodyParser.json({ limit: '16mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '1mb'
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    logger.error('500 error', {
      message: err.message,
      error: err,
      title: 'error'
    });

    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  logger.error('500 error', {
    message: err.message,
    error: err,
    title: 'error'
  });
});

export default app;
