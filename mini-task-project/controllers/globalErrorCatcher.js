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

const handleJsonWebTokenError = () => new AppErrorTrigger('Invalid token. Please log in',401)

const handleTokenExpiredError = () => new AppErrorTrigger('Token has expired. Please log in again',401)

/// Handler ///
module.exports = (err, req, res, next) => {
  console.log("errpr name' :",err);
  if(process.env.NODE_ENV === "development") {
    serveDevError(err,res);
  }else if(process.env.NODE_ENV === "production") {
    let error = {...err};
    // mongoose errors
    if (err?.name === "CastError") {
      error = handleMongoCastError(error);
    }
    // mongodb errors (e.g uniqueness)
    if (err.name === "ValidationError") {
      error = handleMongoValidationError(error);
    }
    // unvalid jwt token (e.g uncorrect signature)
    if (err.name === "JsonWebTokenError") {
      error = handleJsonWebTokenError();
    }
    // expired jwt
    if (err.name === "TokenExpiredError") {
      error = handleTokenExpiredError();
    }


    serveProdError(error,res);
  }
}
