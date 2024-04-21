const {
  createInvoice,
  getInvoicesByUser,
  getInvoiceById,
  getInvoiceByUser,
  updateInvoiceByUser,
  deleteInvoiceByUser,
} = require("./../repositories/invoice");
const {
  validateInvoiceCreation,
  validateInvoiceUpdate,
} = require("./../validations/invoice");
const { getClientById } = require("./../repositories/client");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const filterObj = require("./../utils/filterObj");
const APIFeatures = require("./../utils/ApiFeatures");

// Create Invoice
const createNewInvoice = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { error } = validateInvoiceCreation(req.body);
  if (error) {
    return next(new AppError(`Validation Error: ${error.message}`, 400));
  }

  const client = await getClientById(req.body.client, userId);

  if (!client) {
    return next(new AppError("Client with the specified ID not found", 404));
  }

  const invoiceData = {
    ...req.body,
    user: userId,
  };

  console.log("Invoice Data", invoiceData);

  const invoice = await createInvoice({
    ...invoiceData,
  });

  console.log("Invoice is", invoice);

  if (!invoice) {
    return next(new AppError("Invoice not created", 400));
  }
  //   Calculate the invoice total
  invoice.calculateTotal();

  res.status(201).json({
    status: "success",
    message: "Invoice created successfully",
    data: {
      invoice,
    },
  });
});

const getAllInvoicesForUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  console.log(req.query);
  const query = getInvoicesByUser(userId);
  const features = new APIFeatures(query, req.query);

  features.filtering().sorting().limitFields().pagination();

  const invoices = await features.query;
  // console.log("Invoices", invoices);

  res.status(200).json({
    status: "success",
    result: invoices.length,
    message: "Invoices retrieved successfully",
    data: {
      invoices,
    },
  });
});

const getSingleInvoiceByUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const invoiceId = req.params.invoiceId;

  const invoice = await getInvoiceByUser(userId, invoiceId);

  if (!invoice) {
    return next(new AppError("Invoice not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Invoice retrieved successfully",
    data: {
      invoice,
    },
  });
});

const updateInvoiceDetails = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const invoiceId = req.params.invoiceId;

  if (!invoiceId) return next(new AppError("Invoice ID is required", 400));

  const { error } = validateInvoiceUpdate(req.body);
  if (error) {
    return next(new AppError(`Validation Error: ${error.message}`, 400));
  }

  const allowedFields = filterObj(
    req.body,
    "invoiceNumber",
    "invoiceDate",
    "dueDate",
    "items",
    "amountPaid"
  );

  const invoice = await updateInvoiceByUser(userId, invoiceId, allowedFields);

  if (!invoice) {
    return next(new AppError("Invoice not updated", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Invoice updated successfully",
    data: {
      invoice,
    },
  });
});

const deleteInvoice = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const invoiceId = req.params.invoiceId;

  if (!invoiceId) return next(new AppError("Invoice ID is required", 400));

  const invoice = await getInvoiceByUser(userId, invoiceId);

  if (!invoice) {
    return next(new AppError("Invoice with the specified ID not found", 404));
  }

  const deletedInvoice = await deleteInvoiceByUser(userId, invoiceId);

  if (!deletedInvoice) {
    return next(new AppError("Invoice not deleted", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Invoice deleted successfully",
    data: null,
  });
});

// Features to add
// Search
// Export to CSV
// Export to PDF
// Send Invoice to Client
// Invoice Status Update

module.exports = {
  createNewInvoice,
  getAllInvoicesForUser,
  getSingleInvoiceByUser,
  updateInvoiceDetails,
  deleteInvoice,
};
