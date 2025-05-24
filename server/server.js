import http from "http";
import app from "./app/index.js";
const server = http.createServer(app);
const port = process.env.PORT || 4000;
import connectDB from "./database/index.js";

// * database connection
(async () => {
  try {
    await connectDB();
    console.log("database is connected");
    server.listen(port, "0.0.0.0", () => {
      console.log(`server is running at port : ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.log("Failed to start the server!", error);
    process.exit(1);
  }
})();
