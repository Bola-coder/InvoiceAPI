const express = require("express");

const router = express.Router();

const invoicePaymentController = require("../controllers/invoicePayment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);

router.route("/").post(invoicePaymentController.createPaymentForInvoice);

router
  .route("/:invoiceId")
  .get(invoicePaymentController.getPaymentsForAnInvoice);

module.exports = router;
