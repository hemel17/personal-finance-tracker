import { config } from "dotenv";
config({ path: "./.env" });
import express from "express";
import middleware from "./middleware.js";
import router from "../routes/index.js";
import { notFoundHandler, errorHandler } from "./error.js";
import sendGetReq from "../automation/sendGetReq.js";
const app = express();

// * middlewares
app.use(middleware);

// * routes
app.use(router);

// * automation
sendGetReq();

// * error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
