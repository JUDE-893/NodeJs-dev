const http = require('http');
const fs = require('fs');
const url = require('url');
const replacePlaceHolder = require('./modules/replacePlaceHolder.js');

// reading the json data file
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`,'utf-8');
const jsonData = JSON.parse(data);
// reading templates files
const productTemplate = fs.readFileSync(`${__dirname}/templates/product-template.html`,'utf-8');
const overviewTemplate = fs.readFileSync(`${__dirname}/templates/overview-template.html`,'utf-8');
const cardTemplate = fs.readFileSync(`${__dirname}/templates/card-template.html`,'utf-8');




// create a server using nodejs
const Server = http.createServer( (req,res) => {

  const {query,pathname} = url.parse(req.url,true);

  // The Main Page
  if (pathname === '/' || pathname === '/overview') {
    let cards = jsonData.map( (p) => replacePlaceHolder(cardTemplate,p));
    let overview = overviewTemplate.replace(/{%OVERVIEW_CARDS%}/,cards);
    res.writeHeader(200,{'Content-type':'text/html'});
    res.end(overview);
  }

  // The Overview Page
  else if (pathname === '/product') {
    let data = jsonData.find( (obj) => obj.id === +Object.keys(query)[0].split(':')[1])
    let product = replacePlaceHolder(productTemplate,data);
    res.writeHeader(200, {'Content-type':'text/html'});
    res.end(product);
  }
  // Api Endpoint
  else if (pathname==='/api') {
    res.writeHeader(200,{'Content-type':'application/json'});
    res.end(data);
  }
  // Page Not Found
  else {
    res.writeHeader(400,{contentType: 'text/html',NodeFarm:"the NodeFarm app for local&organic shopping"})
    res.end('<h1>PAGE NOT FOUND</h1>');
  }
})

// listening (configuring the server)
Server.listen(8000,'127.0.0.1', () => {
  console.log('listening to NodeFarm server on port:8000 \nUrl : https://127.0.0.1/');
})
