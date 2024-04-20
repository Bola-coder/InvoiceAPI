const Invoice = require("./../models/invoice.model");

const createInvoice = async function (invoiceData) {
  const invoice = await Invoice.create(invoiceData);
  return invoice;
};

const getInvoicesByUser = async function (userId) {
  const invoices = await Invoice.find({ user: userId });
  return invoices;
};

const getInvoiceById = async function (invoiceId) {
  const invoice = await Invoice.findById(invoiceId);
  return invoice;
};

const getInvoiceByUser = async function (userId, invoiceId) {
  const invoice = await Invoice.findOne({ _id: invoiceId, user: userId });
  return invoice;
};

const updateInvoiceByUser = async function (userId, invoiceId, invoiceData) {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: invoiceId, user: userId },
    invoiceData,
    { new: true }
  );
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
