import AppError from '../utils/AppError.js';


function serveDev(res, error) {
  return res.status(error.statusCode || 500).json({...error,message:error.message})
}

function serveProd(res, error) {
  console.log(error.operational);
  if(error.operational) {

    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errors: error.errors
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

export default function globalErrorCatcher(err, req, res, next) {
  console.log(err);
  if(process.env.NODE_ENV === 'developpement') {
    serveDev(res,err);
  } else if(process.env.NODE_ENV === 'production'){
    let error = {...err};
    console.log(error.operational);

    if(err.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    serveProd(res,error);
  }
}
