const express = require("express");
const authMiddleware = require("./../middlewares/auth.middleware");
const companyController = require("./../controllers/company.controller");
const subscriberMiddleware = require("./../middlewares/subscriber.middleware");
const { logoUploads } = require("./../utils/multer");

const router = express.Router();
router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);
router.use(subscriberMiddleware.checkIfUserIsSubscribed);

router
  .route("/")
  .post(companyController.createNewCompany)
  .get(companyController.getAllCompanies);

router
  .route("/:companyId")
  .get(companyController.getCompanyDetails)
  .patch(companyController.updateCompanyDetails);

router
  .route("/:companyId/logo")
  .patch(logoUploads, companyController.uploadCompanyLogo);

module.exports = router;
