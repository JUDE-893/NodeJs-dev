import express from "express";
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(express.json());
app.use(cors());

const projects = JSON.parse(fs.readFileSync('./data/projects.json', 'utf-8'));
// const projects = fs.readFileSync('./data/recent.json', 'utf-8');

app.get('/', function(req,res) {
  console.log('projects------',projects);
  res.send('hello from portfolio api');
})

app.get('/recent', function(req,res) {
  res.sent('hello from portfolio api');
})

app.get('/all-projects', function(req,res) {
  res.status(200).json({success:true, data: projects});
})

app.listen(3000, () => {
  console.log('started on pot 3000');
})
