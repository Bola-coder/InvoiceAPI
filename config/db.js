const mongoose = require("mongoose");
let mongoURI = process.env.mongoURI;
mongoURI = mongoURI.replace("<password>", process.env.mongoPassword);

const connectToDB = () => {
  mongoose
    .connect(mongoURI)
    .then((con) => {
      console.log("DB Connected successfully");
    })
    .catch((err) => {
      console.log("Error connecting to DB", err);
    });
};
module.exports = connectToDB;
