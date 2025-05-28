import mongoose from 'mongoose';

// CONNECT TO DATBASE

export const connectDB = () => {

  const DB = process.env.DATABASE_LOCAL;

  mongoose.connect(DB, {
    dbName: 'huginn',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 1000
  }}).then(() => {
    console.log('mongoose connected successfully');
  });
}
