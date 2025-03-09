const app = require('./app');

console.log(process.env);
// event emiter on request arrival
app.listen(3000, () => {
  console.log('Listening on port: 3000 ...');
})
