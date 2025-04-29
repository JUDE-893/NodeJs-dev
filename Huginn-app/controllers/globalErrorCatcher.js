import AppError from '../utils/AppError.js';


function serveDev(res, error) {
  return res.status(error.statusCode || 500).json({...error,message:error.message})
}

function serveProd(res, error) {
  console.log(error.operational);
  if(error.operational) {
    console.log('message: ', Object.keys(error));
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errors: error.errors,
      reason: error.reason
    })
  }
  else {
    return res.status(500).json({
      status: error.status,
      message: error.message,
    })
  }
}

function handleValidationError(error) {
  let errors = {};
  let ers = error.errors;

  Object.keys(ers).forEach((item, i) => {
    errors[ers[item].path] = ers[item].message;
  });

  let new_e = new AppError('validation failed', 422);
  new_e.errors = errors;
  return new_e;
}

function handleJWTExpiryError() {

  return {
    status: 'fails',
    statusCode: 401,
    message: 'your session has expired. Please log in again',
    operational: true,
    reason: 'TokenExpiredError'
  }
}

export default function globalErrorCatcher(err, req, res, next) {
  console.log(err);
  if(process.env.NODE_ENV === 'developpement') {
    serveDev(res,err);
  } else if(process.env.NODE_ENV === 'production'){
    let error = {...err};

    console.log('err........: ', Object.keys(err));

    if(err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if(err.name === 'TokenExpiredError') {
      error = handleJWTExpiryError();
    }
    serveProd(res,error);
  }
}
