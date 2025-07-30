// catches the error throw in the embeded function and forward it to the last middleware
export function errorCatchingLayer(fnc) {
  return (req ,res, next) => {
    fnc(req, res, next).catch(next)
  }
}
