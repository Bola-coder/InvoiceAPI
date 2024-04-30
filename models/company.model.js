const mongoose = require("mongoose");

const companySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a company name"],
    trim: true,
  },

  address: {
    type: String,
    required: [true, "Please provide a company address"],
    trim: true,
  },

  email: {
    type: String,
    unique: [true, "Email aleady in use"],
    required: [true, "Please provide an email address"],
    trim: true,
  },

  phoneNumber: {
    type: String,
    unique: [true, "Phone number already in use"],
    required: [true, "Please provide a company phone number"],
  },

  logo: {
    type: String,
  },

  active: {
    type: Boolean,
    default: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
