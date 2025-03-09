const fs = require('fs');

// reading json files content
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`));



// Handlers
exports.getTours = (req,res) => {
  res.status(200).json({
    status : 'success',
    tours,
  })
}

exports.addTour = (req,res) => {
  let id = tours[tours.length-1]._id+1;
  let data = {...req.body, _id:id,};
  tours.push(data);

  fs.writeFile('./dev-data/data/tours.json',JSON.stringify(tours),'utf-8', (err) => {
    if(err) {
      throw('cant push a new record');
      res.status(402).end("can't add a new  tour");
      return;
    }
  })
  res.status(201).end('record added successfuly');
}

exports.getTour = (req,res) => {
  // let id = req.params.id;
  // let tour = tours.find( (el) => el._id==id);
  // if (tour) {
    res.status(200).json({status:'success',tour:req.tour});
  // }else {
  //   res.status(404).json({status: 'fails',message: "Invalid Tour ID!"});
  // }
}

exports.updateTour = (req,res) => {
  // let id = req.params.id;
  // let tour = tours.find( (us) => us._id === id);
  // console.log('compaar : ', req.tour == tour);
  // if (tour) {
    tour = Object.assign(req.tour,req.data);
    fs.writeFile('./dev-data/data/tours.json',JSON.stringify(tours),'utf-8',(err) => {
      if(err) {
        throw('cant update tour record');
        res.status(402).end("can't update tour Data");
        return null;
    }});
    res.status(201).json({status:"sucess",tour: req.tour})
  // }else{
  //   throw('cant update record');
  //   res.status(402).end("can't update tour Data");
  // }
}

exports.deleteTour = (req,res) => {
  // let id = req.params.id;
  // let tour = tours.find( (us) => us._id === id);
  let newTours = tours.filter( (t) => t !== req.tour )
  fs.writeFile('./dev-data/data/tours.json',JSON.stringify(newTours),'utf-8',(err) => {
    if(err) {
      throw('cant delete record');
      res.status(402).end("can't delete tour Data");
      return;
  }});
  res.status(201).json({status:"sucess",undefined})
}

exports.checkID = (req,res,next,id) => {
  let tour = tours.find( (us) => us._id === id);
  // return the tour
  if (tour) {
    req.tour = tour;
    next();
  }else{
    res.status(404).json({status:'fails',message :'invalid IDD'})
    return null;
  }
}
