const express = require('express');
const nunjucks = require('nunjucks');
const mainRouter = require('./routes/mainRoutes');
const participantsRouter = require('./routes/participantsRoutes');
const standsRouter = require('./routes/standsRoutes');
const participationsRouter = require('./routes/participationsRoutes');

const app = express();

// configure the nunjucks tempating engine
nunjucks.configure('./views/templates', {
  express: app,
  noCash: true,
  autoescape:true,
  watch: true
})

// request body parser - Why We should use it ?
/* ``what i can see from your words .. that the req.body is not the request body sent by the client.
and initialy the req object has no "body" property yet until a middleware interfer (body-parser)
and access the original request (sent by the client ) ant parse it from a raw json into a js
associative object then create a "body" property of the req object and assign the json parsed
content to it``*/

app.use(express.static('public'));

app.use(express.json());

app.set('view engine','njk');

app.use('/api/v1',participantsRouter);
app.use('/api/v1',participationsRouter);
app.use('/api/v1',standsRouter);
app.use('/',mainRouter);
/*Green-Neighborhoods*/

module.exports = app;
