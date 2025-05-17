import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { addDays } from "date-fns";

// catches the error throw in the embeded function and forward it to the last middleware
export function errorCatchingLayer(fnc) {
  return (req ,res, next) => {
    fnc(req, res, next).catch(next)
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
