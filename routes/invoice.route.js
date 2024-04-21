const express = require("express");
const authMidlleware = require("./../middlewares/auth.middleware");
const invoiceController = require("./../controllers/invoice.controller");
const router = express.Router();

router.use(authMidlleware.protectRoute, authMidlleware.checkIfEmailIsVerified);

router
  .route("/")
  .post(invoiceController.createNewInvoice)
  .get(invoiceController.getAllInvoicesForUser);

router
  .route("/:invoiceId")
  .get(invoiceController.getSingleInvoiceByUser)
  .patch(invoiceController.updateInvoiceDetails)
  .delete(invoiceController.deleteInvoice);

module.exports = router;
