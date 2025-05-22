import createError from "../utils/error.js";

const notFoundHandler = (_req, _res, next) => {
  const err = createError("Not found!", 404);
  next(err);
};

const errorHandler = (err, _req, res, _next) => {
  let errorStatus = err.status || 500;
  let errorMessage = err.message || "Internal server error!";
  const errorType = err.name || "Unknown Error!";

  if (err.name === "CastError") {
    errorStatus = 400;
    errorMessage = `Invalid ${err.path}`;
  }

  if (err.name === "JsonWebTokenError") {
    errorStatus = 400;
    errorMessage = "Something went wrong! Please try again.";
  }

  if (err.name === "TokenExpiredError") {
    errorStatus = 400;
    errorMessage = "Session expired! Please try again.";
  }

  if (err.code === 11000) {
    errorMessage = `This ${Object.keys(err.keyValue)} is already in use!`;
    errorStatus = 400;
  }

  res.status(errorStatus).json({
    success: false,
    type: errorType,
    message: errorMessage,
  });
};

export { notFoundHandler, errorHandler };
