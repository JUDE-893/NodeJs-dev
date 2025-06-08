const AppErrorTrigger = require('../utils/AppErrorTrigger.js');
const {errorCatchingLayer} = require('../utils/helpers.js');

exports.deleteOne = (Model, tag) => errorCatchingLayer(async (req, res, next) => {
                                const dcm = await Model.findByIdAndDelete(req.params.id,{runValidators:true});

                                if(!dcm) {
                                  return next(new AppErrorTrigger(`Cannot ${tag} find  with that id`,404))
                                }

                                res.status(200).json({status:'success', [tag]: dcm});
                            })

exports.updateOne = function (Model, tag) {
  return errorCatchingLayer(async (req, res, next) => {
      //  new : returns the updated object | runValidators : trigger validation on updated fields
      const bcm = await Model.findByIdAndUpdate(req.params.id, req.body, {new: true,runValidators:true});
      console.log(bcm, req.body);
      if(!bcm) {
        return next(new AppErrorTrigger(`Cannot ${tag} find  with that id`,404))
      }

      res.status(200).json({status:'success',[tag]: bcm});
  })

};

exports.createOne = (Model,tag) => {
  return errorCatchingLayer(async (req, res) => {

        const data = await Model.create(req.body);
        console.log(tag ,data);
        res.status(200).json({status:'success',[tag]: data});
  })
}

exports.readOne = (Model, tag, populateWith) => {
  return errorCatchingLayer(async (req, res, next) => {

      let query =  Model.findById(req.params.id)
      query = populateWith ? query.populate(populateWith) : query;
      const dcm = await query;

      if(!dcm) {
        return next(new AppErrorTrigger(`Cannot find ${tag} with that id`,404))
      }

      res.status(200).json({status:'success', [tag]: dcm});
  })
}
