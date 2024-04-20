const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./config/db");
const PORT = process.env.PORT || 8000;

const app = require("./app");

connectToDB();

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Synconference!");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
