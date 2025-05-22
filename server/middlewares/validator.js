import createError from "../utils/error.js";

// Middleware function
export const validate = (schema) => {
  return (req, _res, next) => {
    try {
      const data = schema.parse(req.body);
      req.validatedData = data;
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        next(createError(error.errors[0].message, 400));
      } else {
        next(error);
      }
    }
  };
};
