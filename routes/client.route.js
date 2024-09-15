const authMiddleware = require("../middlewares/auth.middleware");
const clientController = require("../controllers/client.controller");
const express = require("express");

const router = express.Router();

router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);

router
  .route("/")
  .get(clientController.getAllClientsForUser)
  .post(clientController.createNewClient);

router.route("/company/create").post(clientController.createClientForCompany);

router
  .route("/:clientId")
  .get(clientController.getClientDetails)
  .patch(clientController.updateClientDetails)
  .delete(clientController.removeClient);

module.exports = router;
