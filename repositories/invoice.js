const Invoice = require("./../models/invoice.model");

const createInvoice = async function (invoiceData) {
  const invoice = await Invoice.create(invoiceData);
  return invoice.populate("client user");
};

const getInvoicesByUser = function (userId) {
  const invoices = Invoice.find({ user: userId }).populate("client user");
  // console.log("Invoices", invoices);
  return invoices;
};

const getInvoiceById = async function (invoiceId) {
  const invoice = await Invoice.findById(invoiceId).populate("client user");
  return invoice;
};

const getInvoiceByUser = async function (userId, invoiceId) {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    user: userId,
  }).populate("client user");
  return invoice;
};

const updateInvoiceByUser = async function (userId, invoiceId, invoiceData) {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: invoiceId, user: userId },
    invoiceData,
    { new: true }
  ).populate("client user");
  return invoice;
};

const deleteInvoiceByUser = async function (userId, invoiceId) {
  const invoice = await Invoice.findOneAndDelete({
    _id: invoiceId,
    user: userId,
  });
  return invoice;
};
module.exports = {
  createInvoice,
  getInvoicesByUser,
  getInvoiceById,
  getInvoiceByUser,
  updateInvoiceByUser,
  deleteInvoiceByUser,
};
