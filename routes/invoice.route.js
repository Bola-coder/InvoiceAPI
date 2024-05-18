const express = require("express");
const authMidlleware = require("./../middlewares/auth.middleware");
const invoiceController = require("./../controllers/invoice.controller");
const router = express.Router();

router.use(authMidlleware.protectRoute, authMidlleware.checkIfEmailIsVerified);

router
  .route("/")
  .post(invoiceController.createNewInvoice)
  .get(invoiceController.getAllInvoicesForUser);

router.route("/stats").get(invoiceController.getInvoiceStats);

router
  .route("/stats/getByStatus")
  .get(invoiceController.getInvoiceByStatusGraphStat);

router
  .route("/stats/getTotalInvoice")
  .get(invoiceController.getTotalNumberOfInvoicesCreatedEachDay);

router.route("/stats/payment").get(invoiceController.getPaymentStatsForDays);
router
  .route("/:invoiceId")
  .get(invoiceController.getSingleInvoiceByUser)
  .patch(invoiceController.updateInvoiceDetails)
  .delete(invoiceController.deleteInvoice);

router.get("/invoice/search", invoiceController.searchForInvoice);

router
  .route("/convert/:invoiceId")
  .patch(invoiceController.convertInvoiceToPdf);

module.exports = router;
