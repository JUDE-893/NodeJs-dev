const  jwt = require('jsonwebtoken');
const promisify = require('./promisify.js');
/// HELPERS

// genrate a jwt token | <id> : document id
exports.signJwt = function(id) {
  return jwt.sign({id},process.env.JWT_SIGNATURE, {expiresIn: process.env.JWT_EXPIRES_IN});
}


// WRAPPER FUNCTION | <fn> : controller method
// wrap each handler try{} block content, and catch any occured error in order to forward it to the global error handling middleware, in order to avoide repitition
exports.errorCatchingLayer = function(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

// hash the user token payload with the stored signature and compares it with the submited jwt
// any difference wetween thz generated jwt and recieved one will return false (invalid jwt) as each signature will always produce a constant token from a constant payload
// then no body should be able the to change the payload and pass the verification.
// <tk> : jwt token  (eg retrieved fron headers)
exports.verifyJwt = async function(tk) {
  return await promisify(jwt.verify)(tk,process.env.JWT_SIGNATURE);
};

// filter the unwanted fields from an object, recieves the wanted fields | <obj> , <*fields> : remaining fields
exports.filterObject = function(obj, ...fields) {
  let filterd={};
  Object.keys(obj).forEach((item) => {
    console.log(item);
    if(fields.includes(item)) {
      filterd[item] = obj[item];
    }
  });
return filterd;

}
