import cron from "node-cron";

const sendGetReq = () => {
  cron.schedule("*/5 * * * *", () => {
    fetch("https://personal-finance-tracker-11jk.onrender.com")
      .then()
      .catch((err) => console.log("Error:", err.message));
  });
};

export default sendGetReq;
