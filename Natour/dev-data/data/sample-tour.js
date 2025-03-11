const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/TourModel.js');


// load the env variables
dotenv.config({path: './.env'});

// set up the host url
const DB = process.env.DATABASE.replace('<DB_PASSWORD>',process.env.DATABASE_PASSWORD);

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
});

//  sample tours
const tours = JSON.parse(fs.readFileSync( `${__dirname}/tour-simple.json`,'utf-8'))

// Export sample data
async function exportSample(tours){
  try {
    await Tour.deleteMany();
    const result = await Tour.create(tours);
    return result;
  } catch (e) {
    console.log("Cant Export Sample Date : ", e);
  } finally {
    process.exit();
  }
}

// Export sample data
async function clearSample(){
  try {
    await Tour.deleteMany();
  } catch (e) {
    console.log("Cant clear Sample Date : ", e);
  } finally {
    process.exit();
  }
}

// script
async function script() {
if(process.argv[2] === "--export") {
  let rslt = await exportSample(tours);
  console.log(rslt);
}
else if (process.argv[2] === "--clear") {
  clearSample();
}

}

script();

console.log(process.argv[2]);
