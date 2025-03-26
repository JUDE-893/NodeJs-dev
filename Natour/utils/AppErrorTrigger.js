class AppErrorTrigger extends Error {
  constructor(message,statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fails' : 'error';
    this.isoperational = true;
    Error.captureStackTrace(this, this.constructor); // excluding the constructopr method from showing in the stack trace
  }
}

module.exports = AppErrorTrigger;
