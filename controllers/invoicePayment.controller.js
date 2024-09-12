const InvoicePayment = require("../models/invoicePayment.model.js");
const Invoice = require("../models/invoice.model.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/AppError.js");
const sendEmail = require("../utils/email.js");
const createReceiptTemplate = require("../templates/receipt.js");
const { populate } = require("dotenv");
const convertHtmlTemplateToPdf = require("../helper/convertHtmlToPdf.js");

const createPaymentForInvoice = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { invoiceId, payments } = req.body;

  if (!invoiceId || !payments) {
    return next(new AppError("Please provide an invoice, and payments", 400));
  }

  const paymentExist = await InvoicePayment.findOne({ invoiceId });
  let payment;

  console.log(paymentExist, "paymentExist");
  if (!paymentExist) {
    payment = await InvoicePayment.create({
      invoiceId,
      payments,
      user: userId,
    });
  } else {
    payment = await InvoicePayment.findOneAndUpdate(
      { invoiceId },
      {
        payments,
        // user: userId,
      },
      { new: true }
    );
  }

  if (!payment) {
    return next(new AppError("Payment not created", 400));
  }

  // Updating the amount paid and balance field in the invoice document
  const invoice = await Invoice.findById(invoiceId);

  invoice.amountPaid = payments.reduce((acc, payment) => {
    return acc + payment.amount;
  }, 0);

  invoice.balance = invoice.total - invoice.amountPaid;
  await invoice.save();

  res.status(201).json({
    status: "success",
    message: "Payment history created successfully",
    data: {
      payment,
    },
  });
});

const getPaymentsForAnInvoice = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const invoiceId = req.params.invoiceId;
  const invoicePayments = await InvoicePayment.find({
    user: userId,
    invoiceId: invoiceId,
  });

  if (!invoicePayments) {
    return next(new AppError("No payment history found for this invoice", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      invoicePayments,
    },
  });
});

const getPaymentStats = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { days } = req.query;
  const paymentStats = await InvoicePayment.aggregate([
    {
      $match: {
        user: userId,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$payments.date" },
        },
        totalAmountPaid: { $sum: "$payments.amount" },
        totalPayments: { $sum: 1 },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $limit: parseInt(days) || 7,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      paymentStats,
    },
  });
});

const getRecieptForPayment = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const invoiceId = req.params.invoiceId;

  const invoicePayments = await InvoicePayment.find({
    user: userId,
    invoiceId: invoiceId,
  });

  if (!invoicePayments) {
    return next(new AppError("No payment history found for this invoice", 404));
  }

  const invoice = await Invoice.findById(invoiceId).populate("client");

  const receipt = {
    invoiceId: invoice.invoiceNumber,
    date: new Date().toDateString(),
    customerName: invoice.client.name,
    customerEmail: invoice.client.email,
    items: invoice.items,
    totalAmount: invoice.total,
    amountPaid: invoicePayments[0].payments.reduce((acc, payment) => {
      return acc + payment.amount;
    }, 0),
    balance: invoice.balance,
    payments: invoicePayments[0].payments,
  };

  console.log(receipt, "receipt");

  const receiptTemplate = createReceiptTemplate(receipt);
  // Send receipt as email
  sendEmail({
    email: receipt.customerEmail,
    subject: `Payment Receipt for Invoice #${receipt.invoiceId}`,
    html: receiptTemplate,
  });

  res.status(200).json({
    status: "success",
    message: "Receipt sent to the client successfully",
    data: {
      receipt,
    },
  });
});
module.exports = {
  createPaymentForInvoice,
  getPaymentsForAnInvoice,
  getPaymentStats,
  getRecieptForPayment,
};
