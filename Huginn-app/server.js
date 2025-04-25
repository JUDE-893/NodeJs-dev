import app from './index.js';
import dotenv from 'dotenv'
import mongoose from 'mongoose';

dotenv.config()

const DB= process.env.DATABASE_LOCAL;

// connect
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
})


app.listen(process.env.PORT || 3000, () => {
  console.log(`Huginn app started on port..........${process.env.PORT}`);
} )
