import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { addDays } from "date-fns";

// catches the error throw in the embeded function and forward it to the last middleware
export function errorCatchingLayer(fnc) {
  return (req ,res, next) => {
    fnc(req, res, next).catch(next)
  }
}

// catches the error throw in the embeded function and
export function wsErrorCatchingLayer(fnc) {
  return (socket, next) => {
    fnc(socket, next).catch((e) => {
      console.log('dddddddddddddddrrrrrrrrrrr',e);
      return next(e)
    })
  }
}

//  create a jwt token holding the user id
export function signJWT(id) {
  let token = jwt.sign({id},process.env.JWT_SALT, {expiresIn: process.env.JWT_EXPIRES_IN});
  return token
}

//  create a jwt token holding the user id
export function verifyJWT(token) {
  let result = jwt.verify(token, process.env.JWT_SALT);
  return result;
}

//  create a jwt token holding the user id
export function setJwtCookie(res, token) {
  res.cookie('jwt_token',token, {
    expires: addDays(new Date(), 1),
    sameSite: process.env.JWT_SAME_SITE,
    secure: process.env.JWT_SECURE==='true',
    httpOnly: process.env.JWT_HTTP_ONLY==='true'
  })
}

// ecrypt a text
export function encrypt(text, secret) {
  //  advanced encryption standart 256 cipher block chaining
  let cipher = crypto.createCipher('aes-256-cbc', secret); // create a cipher object
  let encryptedCipher = cipher.update(text, 'utf-8', 'hex'); // encrypt
  encryptedCipher += cipher.final('hex'); // generate the final hex part
  return encryptedCipher
}

// decrypt a text
export function decrypt(text, secret) {
  //  advanced encryption standart 256 cipher block chaining
  let decipher = crypto.createDecipher('aes-256-cbc', secret); // create a decipher object
  let decryptedCipher = decipher.update(text, 'hex', 'utf-8'); // decrypt
  decryptedCipher += decipher.final('utf-8'); // generate the final hex part
  return decryptedCipher
}

// function that return a derived new Object from given object and array of desired keys
const fromObject = (obj, keys) =>
  Object.fromEntries(keys.map(key => [key, obj[key]]));

// global unhandled error é rejections handler 
export const cdebugger = () => {
  // Handle ALL error types
  const handleError = (err, origin) => {
    console.log(`💥 CRITICAL ${origin}:`, err);
    console.error(`💥 CRITICAL ${origin}:`, err);

    // Optional: Send to error tracking (Sentry, etc.)
    // require('@sentry/node').captureException(err);

    process.exit(1); // Exit with failure code
  };

  // Catch all possible error types
  process.on('uncaughtException', (err) => handleError(err, 'uncaughtException'));
  process.on('unhandledRejection', (err) => handleError(err, 'unhandledRejection'));
  process.on('SIGTERM', () => handleError(new Error('SIGTERM'), 'SIGTERM'));
  process.on('SIGINT', () => handleError(new Error('SIGINT'), 'SIGINT'));

  // Optional: Operational errors (non-crashing)
  process.on('warning', (warning) => {
    console.warn('⚠️ Warning:', warning);
  });
}
