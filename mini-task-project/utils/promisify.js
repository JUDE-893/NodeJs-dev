module.exports = fn => {
  return (...args) => {
    return new Promise((resolve,reject) => {
      fn(...args, (err,result) => {
        // error
        if (err) {
          return reject(err);
        }
        return resolve(result);
      })
    });
  }
};
