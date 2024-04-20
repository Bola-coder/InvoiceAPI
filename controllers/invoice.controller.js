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
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const filterObj = require("./../utils/filterObj");

// Create Invoice
const createNewInvoice = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { error } = validateInvoiceCreation(req.body);
  if (error) {
    return next(new AppError(`Validation Error: ${error.message}`, 400));
  }

  const invoiceData = {
    ...req.body,
    user: req.user._id,
  };

  const invoice = await createInvoice({
    user: userId,
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
  const userId = req.user._id;
  const invoices = await getInvoicesByUser(userId);
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
    "clientName",
    "clientEmail",
    "clientAddress",
    "clientPhoneNumber",
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

// Delete Invoice
// Filtering and Sorting
// Pagination
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
};
