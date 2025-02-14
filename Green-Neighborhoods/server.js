const app = require('./index');
// const migrations = require('./models/migrations');

//listen to the upcomming requests (the event emitter)
app.listen(3000, () => {
  console.log('Listening on port : 3000');
  console.log('Api Main Endpoint : https://localhost:3000');
})
