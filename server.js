const dotenv = require("dotenv");
dotenv.config();
const connectToDB = require("./config/db");
const { InvoiceCounter } = require("./models/invoice.model");

const PORT = process.env.PORT || 8000;

const app = require("./app");

connectToDB();

// Initialize the invoice counter
const initializeInvoiceCounter = async () => {
  try {
    const counter = await InvoiceCounter.findOne({ id: "invoice" });
    if (!counter) {
      await InvoiceCounter.create({ id: "invoice", seq: 0 });
      console.log("Invoice counter initialized");
    }
  } catch (error) {
    console.log("Error intializing invoice counter", error);
  }
};

initializeInvoiceCounter();

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
