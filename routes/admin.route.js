const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const adminMiddlweare = require("../middlewares/admin.middleware");

router.post("/super", adminController.createSuperAdmin);
router.post(
  "/",
  adminMiddlweare.protectAdminRoute,
  adminMiddlweare.checkIfIsSuperAdmin,
  adminController.createAdmin
);

router.post("/login", adminController.adminLogin);

router
  .route("/users")
  .get(adminMiddlweare.protectAdminRoute, adminController.getAllUsers);

router
  .route("/:id")
  .patch(adminMiddlweare.protectAdminRoute, adminController.updateAdminProfile)
  .delete(
    adminMiddlweare.protectAdminRoute,
    adminMiddlweare.checkIfIsSuperAdmin,
    adminController.deleteAdminAccount
  );

router
  .route("/users/:id")
  .delete(adminMiddlweare.protectAdminRoute, adminController.deleteUserAccount);
module.exports = router;
