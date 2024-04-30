const mongoose = require("mongoose");

const paymentHistorySchema = mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: [true, "Please provide an invoice"],
  },
  paymentDate: {
    type: Date,
    required: [true, "Please provide a payment date"],
  },

  payments: [
    {
      paymentMethod: {
        type: String,
        required: [true, "Please provide a payment method"],
      },
      amount: {
        type: Number,
        required: [true, "Please provide an amount"],
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

paymentHistorySchema.index({ invoice: "text" });

const PaymentHistory = mongoose.model("PaymentHostory", paymentHistorySchema);

module.exports = PaymentHistory;
