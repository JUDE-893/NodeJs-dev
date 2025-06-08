const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// load the env variables
dotenv.config({path: './.env'});

// SETTING A GLOBAL ERROR CATCHING LAYER FOR UNCAUGTH EXCEPTIONs.
process.on('uncaughtException', err => {
  console.log(`[UNCAUGHT EXCEPTION] FOR [${err?.name}] : ${err?.message} \n⚠️ SERVER IS SHUTTING DOWN ...`);
  process.exit(1);
});

// set up the host url
// const DB = process.env.DATABASE.replace('<DB_PASSWORD>',process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE_LOCAL;

// connect
mongoose.connect(DB, {
  dbName: 'mini-task-project',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
}}).then(() => {
  console.log('mongoose connected successfully');
})

// mongoose.set('debug', true);


// event emiter on request arrival
const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port: ',process.env.PORT);
})

// SETTING A GLOBAL ERROR CATCHING LAYER FOR EXCEPTION THROWN OUTSIDE OF EXPRESS APP.
process.on('unhandledRejection', err => {
  console.log(`[UHANDLED REJECTION] FOR [${err?.name}] : ${err?.message} \n⚠️ SERVER IS SHUTTING DOWN ...`);
  server.close(() => {
    process.exit(1);
  });
});
