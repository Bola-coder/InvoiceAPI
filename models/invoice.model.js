const { required } = require("joi");
const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, "Please provide an invoice number"],
    unique: [true, "Invoice number already exists"],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: [true, "Please provide a client"],
  },
  invoiceDate: {
    type: Date,
    required: [true, "Please provide an invoice date"],
  },
  dueDate: {
    type: Date,
    required: [true, "Please provide a due date"],
  },
  items: [
    {
      itemName: {
        type: String,
        required: [true, "Please provide an item name"],
      },
      quantity: {
        type: Number,
        required: [true, "Please provide a quantity"],
      },
      price: {
        type: Number,
        required: [true, "Please provide a price"],
      },
    },
  ],
  total: {
    type: Number,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["draft", "sent", "not-paid", "partially-paid", "paid"],
    default: "draft",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

invoiceSchema.index({ invoiceNumber: "text" });

// Create an instance method to calculate the total of the invoice
invoiceSchema.methods.calculateTotal = function () {
  const total = this.items.reduce((acc, item) => {
    return acc + item.quantity * item.price;
  }, 0);
  this.total = total;
  let tempBalance = this.total - (this.amountPaid || 0);
  this.balance = tempBalance;
  return total;
};

// Create a post middleware to calculate the balance of the invoice
invoiceSchema.post("findOneAndUpdate", function (doc, next) {
  if (doc) {
    const total = doc.calculateTotal();
    const amountPaid = doc.amountPaid || 0;
    doc.balance = total - amountPaid;
    return doc.save();
  }
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
