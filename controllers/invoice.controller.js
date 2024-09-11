const Invoices = require("./../models/invoice.model");
const fs = require("fs");
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
const createInvoiceDetailsTemplate = require("./../helper/createInvoiceDetailsTemplate");
const convertHtmlTemplateToPdf = require("./../helper/convertHtmlToPdf");
const { uploader } = require("./../utils/cloudinary");

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

  // console.log("Invoice Data", invoiceData);

  const invoice = await createInvoice({
    ...invoiceData,
  });

  console.log("Invoice is", invoice);

  if (!invoice) {
    return next(new AppError("Invoice not created", 400));
  }
  //   Calculate the invoice total
  invoice.calculateTotal();
  await invoice.save();

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
    "amountPaid",
    "status"
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

// FIXME: Not working as expected
const searchForInvoice = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const query = req.query.q;

  if (!query) {
    return next(new AppError("Search query is required", 400));
  }

  let queryResult = getInvoicesByUser(userId);

  queryResult = queryResult.find({ $text: { $search: query } });

  const invoices = await queryResult;

  if (!invoices) {
    return next(new AppError("No invoices found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Invoices retrieved successfully",
    data: {
      invoices,
    },
  });
});

const getInvoiceStats = catchAsync(async (req, res, next) => {
  /* Get the total number of invoices in the specified period - (days) */
  const intervalPeriod = parseInt(req.query.intervalPeriod);
  console.log(intervalPeriod);
  const userId = req.user._id;
  const invoices = await Invoices.aggregate([
    {
      $match: {
        user: userId,
        invoiceDate: {
          $gte: new Date(
            new Date().setDate(new Date().getDate() - intervalPeriod)
          ),
          $lte: new Date(),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: "$total" },
        totalAmountRecieved: { $sum: "$amountPaid" },
        balanceDue: { $sum: "$balance" },
      },
    },
    {
      $sort: { invoiceDate: -1 },
    },
  ]);

  if (invoices.length === 0) {
    res.status(200).json({
      status: "success",
      message: "No invoices found",
      data: {
        invoiceStats: [],
      },
    });
    return;
  }

  res.status(200).json({
    status: "success",
    message: "Invoice stats retrieved successfully",
    data: {
      invoiceStats: invoices[0],
    },
  });
});

const convertInvoiceToPdf = catchAsync(async (req, res, next) => {
  const { invoiceId } = req.params;
  if (!invoiceId) {
    return next(new AppError("Please provide an invoice ID", 400));
  }
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    return next(new AppError("Can't find invoice with the specified ID", 404));
  }

  const invoiceHtmlTemplate = createInvoiceDetailsTemplate(invoice);

  const pdfFilePath = await convertHtmlTemplateToPdf(invoiceHtmlTemplate);
  // Upload to cloudinary
  try {
    const pdfUrl = await new Promise((resolve, reject) => {
      uploader.upload(
        pdfFilePath,
        { resource_type: "raw", folder: "InvoiceAPI/Invoices/pdf" },
        (err, result) => {
          if (err) {
            console.error("Cloudinary upload error:", err);
            reject(new AppError(err.message, 404));
          }
          // Delete PDF file from local machine
          fs.unlinkSync(pdfFilePath);
          console.log(result.secure_url);
          resolve(result.secure_url);
        }
      );
    });

    invoice.pdf = pdfUrl;
    await invoice.save();
    res.status(200).json({
      status: "success",
      message: "Template gotten and converted successfully",
      data: {
        pdf: pdfUrl,
      },
    });
  } catch (errpr) {
    return next(new AppError("Failed to convert to pdf"));
  }
});

const getInvoiceByStatusGraphStat = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const invoices = await Invoices.aggregate([
    {
      $match: {
        user: userId,
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);

  if (invoices.length === 0) {
    return next(new AppError("No invoices found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Invoice stats retrieved successfully",
    data: {
      invoices,
    },
  });
});

const getTotalNumberOfInvoicesCreatedEachDay = catchAsync(
  async (req, res, next) => {
    const userId = req.user._id;
    const numberOfDays = parseInt(req.query.days);
    const invoices = await Invoices.aggregate([
      {
        $match: {
          user: userId,
          invoiceDate: {
            $gte: new Date(
              new Date().setDate(new Date().getDate() - numberOfDays)
            ),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } },
          total: { $sum: 1 },
        },
      },
    ]);

    if (invoices.length === 0) {
      return next(new AppError("No invoices found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Invoice stats retrieved successfully",
      data: {
        invoices,
      },
    });
  }
);

const getPaymentStatsForDays = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const numberOfDays = parseInt(req.query.days);
  const paymentStats = await Invoices.aggregate([
    {
      $match: {
        user: userId,
        invoiceDate: {
          $gte: new Date(
            new Date().setDate(new Date().getDate() - numberOfDays)
          ),
          $lte: new Date(),
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$invoiceDate" } },
        total: { $sum: "$total" },
        totalPaid: { $sum: "$amountPaid" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  if (paymentStats.length === 0) {
    res.status(200).json({
      status: "success",
      message: "No payment stats found",
      data: {
        invoiceStats: [],
      },
    });
    return;
  }

  res.status(200).json({
    status: "success",
    message: "Invoice stats retrieved successfully",
    data: {
      paymentStats,
    },
  });
});

// Features to add
// Send Invoice to Client

module.exports = {
  createNewInvoice,
  getAllInvoicesForUser,
  getSingleInvoiceByUser,
  updateInvoiceDetails,
  deleteInvoice,
  searchForInvoice,
  getInvoiceStats,
  convertInvoiceToPdf,
  getInvoiceByStatusGraphStat,
  getTotalNumberOfInvoicesCreatedEachDay,
  getPaymentStatsForDays,
};
