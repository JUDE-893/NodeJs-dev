import express from "express";
import cors from 'cors';
import getAccessToken from './utils/getAccessToken.js';

const app = express();

//json parser middleware
app.use(express.json());

/* cors middleware | to allow Cross-Origin Resource Sharing
* The backend must include the Access-Control-Allow-Origin header in the response.
* the browser will then allow cross-origin resource sharing from that particular address
*/
app.use(cors())

app.get('/',(req,res) =>{
  res.end('Welcome To Balena Ai Assistant Back-end Application Interface 🚀')
})

app.post("/Balena/api",(req,res) =>{

  const {roomName,participantName} = req.body;
  console.log(req.body);
  // call the the genrate JWT function
  getAccessToken(roomName,participantName)
    .then( (resp) => res.status(200).json({access_token: resp}))
    .catch((er) => {
      console.log('err',er);
      res.status(403).json({message:"Access denied!",error: er});
    });

})

export default app
