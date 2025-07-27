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
