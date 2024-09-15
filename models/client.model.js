const mongoose = require("mongoose");

const clientSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a client name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a client email"],
  },
  address: {
    type: String,
    required: [true, "Please provide a client address"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a client phone number"],
  },
  archived: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
