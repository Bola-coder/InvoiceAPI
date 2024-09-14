const express = require("express");
const {
  createNewSubscription,
  verifySubscription,
  paystackWebHook,
  checkSubscriptionStatus,
} = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/paystack/webhook", paystackWebHook);
router.use(authMiddleware.protectRoute, authMiddleware.checkIfEmailIsVerified);

router.post("/initialize", createNewSubscription);
router.get("/verify/:reference", verifySubscription);

router.post("/check_status", checkSubscriptionStatus);

module.exports = router;
