const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// load the env variables
dotenv.config({path: './.env'});

// set up the host url
// const DB = process.env.DATABASE.replace('<DB_PASSWORD>',process.env.DATABASE_PASSWORD);
const DB = process.env.DATABASE_LOCAL;

// connect
mongoose.connect(DB, {
  dbName: 'natour',
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



// create a new toor
// const testTour = new Tour({
//   name: 'the Forest Hikers s2',
//   rating: 4.6,
//   price: 500
// })
//
// // insert the newly created tour object
// testTour.save().then( (re) => console.log(re))
//                .catch( (e) => console.log(e))

//
// event emiter on request arrival
const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port: ',process.env.PORT);
})

// SETTING A GLOBAL ERROR CATCHING LAYER FOR EXCEPTION THROWN OUTSIDE OF EXPRESS APP.
process.on('unhandledRejection', err => {
  console.log(`[UHANDLED REJECTION] FOR [${err?.name}] : ${err?.message} \n⚠️ SERVER IS SHUTTING DOWN`);
  server.close(() => {
    process.exit();
  });
});
