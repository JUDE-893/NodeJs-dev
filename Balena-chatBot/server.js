import dotenv from 'dotenv';
import app from './index.js'
//load the environement variables
dotenv.config();


const port = process.env.PORT;

app.listen(port, () => {
  console.log('Balena App is Running on port............',port);
});
