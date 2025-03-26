const getAllEndpoints = (app) => {
  const endpoints = [];

  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Routes by itself
      endpoints.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path,
      });
    } else if (middleware.name === 'router') { // Middleware (like app.use())
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          endpoints.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: handler.route.path,
          });
        }
      });
    }
  });

  return endpoints;
};
