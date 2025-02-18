import dotenv from 'dotenv';

//load the environement variables
dotenv.config();


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Balena App is Running  on port:',port);
});
