const asyncHandler = (fn) => {
  if (typeof fn !== "function") {
    throw new TypeError("asyncHandler requires a function parameter!");
  }

  return (req, res, next) => {
    let errorHandled = false;

    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (!errorHandled) {
        errorHandled = true;

        err.route = req.originalUrl;
        err.method = req.method;

        next(err);
      }
    });
  };
};

export default asyncHandler;
