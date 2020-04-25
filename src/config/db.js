import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const mongoURI = `mongodb://localhost:27017/node-ancestry-example-${process.env.NODE_ENV}`;
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

export { mongoose, Schema };
