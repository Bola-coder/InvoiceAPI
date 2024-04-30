const { required } = require("joi");
const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    trim: true,
  },

  amount: {
    type: Number,
    required: [true, "Please provide an amount"],
  },

  planCode: {
    type: String,
    required: [true, "Please provide a plan code"],
  },

  customerCode: {
    type: String,
    required: [true, "Please provide a customer code"],
  },

  reference: {
    type: String,
  },

  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
