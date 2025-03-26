const AppErrorTrigger = require('../utils/AppErrorTrigger.js')

/// HELPERS ///

// Function that serves a custom on-error response during the developpent environement
const serveDevError = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    isoperational: err.isoperational,
    // errori: err
  })
}

// Function that serves a custom on-error response during the production environement
const serveProdError = (err, res) => {
  // operational error, explicitly invoked

  if(err.isoperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors
    });
  //  non operational error, unexpected
  } else {
    console.error();('[NON OPERATIONAL ERROR].......',err);
    res.status(500).json({
      status: err.status,
      message: err.message,
    })

}
}

// function than handles mongo db thrown cast-error type
const handleMongoCastError = (err) => {
  let message = `Invalid value of ${err.path}:${err.value}`;
  return new AppErrorTrigger(message,400)
}

const handleMongoValidationError = (err) => {

  let raw = Object.values(err.errors);
  let errors = {};
  console.log(err);
  raw.forEach((e) => {
     errors[ e.path] = e.message;
  });

  let message = `Invalid data values entry!`;
  let erro = new AppErrorTrigger(message,422);
  erro.errors = errors;
  return erro
}

/// Handler ///
module.exports = (err, req, res, next) => {
  console.log("errpr name' :",err?.name);
  if(process.env.NODE_ENV === "development") {
    serveDevError(err,res);
  }else if(process.env.NODE_ENV === "production") {
    let error = {...err};

    if (err?.name === "CastError") {
      error = handleMongoCastError(error);
    }

    if (err.name === "ValidationError") {
      error = handleMongoValidationError(error);
    }
  
    serveProdError(error,res);
  }
}
