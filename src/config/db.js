const mongoose = require('mongoose');
const { mongoURI } = require('./secrets');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// if (process.env.NODE_ENV === 'development') {
//   mongoose.set('debug', true);
// }

mongoose.connection.on('connected', () => {
  process.env.NODE_ENV !== 'test' && console.log(`Mongoose connection open to ${mongoURI}`);
});

mongoose.connection.on('error', (err) => {
  process.env.NODE_ENV !== 'test' && console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  process.env.NODE_ENV !== 'test' && console.log('Mongoose connection disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    process.env.NODE_ENV !== 'test' && console.log('Mongoose connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports = { mongoose, Schema };
