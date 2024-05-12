const mongoose = require("mongoose");

const invoicePaymentSchema = mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: [true, "Please provide an invoice id"],
  },
  payments: [
    {
      // paymentMethod: {
      //   type: String,
      //   required: [true, "Please provide a payment method"],
      // },
      amount: {
        type: Number,
        required: [true, "Please provide an amount"],
      },
      date: {
        type: Date,
        required: [true, "Please provide a payment date"],
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

invoicePaymentSchema.index({ invoice: "text" });

const InvoicePayment = mongoose.model("InvoicePayment", invoicePaymentSchema);

module.exports = InvoicePayment;
