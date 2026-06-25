const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/AppError');

const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? true
    : process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
if (process.env.NODE_ENV !== 'development') {
  app.use('/api', limiter);
}

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api', routes);

app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

module.exports = app;
