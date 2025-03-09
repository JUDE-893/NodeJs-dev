const fs = require('fs');

// reading json files content
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));

// Handlers
exports.getUser = (req,res) => {
  let id = req.params.id;
  let user = users.find( (el) => el._id === id);

  if (user) {
    res.status(200).json({
      status : 'success',
      user
    })
  }else{res.status(404).json({status: 'fails',message: "Invalid Tour ID!"});}
};

exports.getUsers = (req,res) => {
  res.status(200).json({
    status: 'success',
    users
  })
}

exports.addUser = (req,res) => {
  let id = users[users.length-1]._id+1;
  let data = {...req.body, _id:id,};
  users.push(data);

  fs.writeFile('./dev-data/data/users.json',JSON.stringify(users),'utf-8', (err) => {
    if(err) {
      throw('cant push a new record');
      res.status(402).end("can't add a new  user");
      return;
    }
  })
  res.status(201).end('record added successfuly');
}

exports.updateUser = (req,res) => {
  let id = req.params.id;
  let user = users.find( (us) => us._id === id);

  if (user) {
    user = Object.assign(user,req.data);
    fs.writeFile('./dev-data/data/users.json',JSON.stringify(users),'utf-8',(err) => {
      if(err) {
        throw('cant update record');
        res.status(402).end("can't update user Data");
        return;
    }});
    res.status(201).json({status:"sucess",user})
  }else{
    throw('cant update record');
    res.status(402).end("can't update user Data");
  }
}

exports.deleteUser = (req,res) => {
  let id = req.params.id;
  let user = users.find( (us) => us._id === id);
  let newUsers = tours.filter( (u) => u !== tour )
  fs.writeFile('./dev-data/data/users.json',JSON.stringify(newUsers),'utf-8',(err) => {
    if(err) {
      throw('cant delete record');
      res.status(402).end("can't delete user Data");
      return;
  }});
  res.status(201).json({status:"sucess",undefined})
}
