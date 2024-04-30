const express = require("express");
const authMiddleware = require("./../middlewares/auth.middleware");
const companyController = require("./../controllers/company.controller");

const router = express.Router();
router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);
router.route("/").post(companyController.createNewCompany);

module.exports = router;
