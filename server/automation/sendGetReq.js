import cron from "node-cron";

const sendGetReq = () => {
  cron.schedule("*/5 * * * *", () => {
    fetch("http://localhost:3000/")
      .then()
      .catch((err) => console.log("Error:", err.message));
  });
};

export default sendGetReq;
