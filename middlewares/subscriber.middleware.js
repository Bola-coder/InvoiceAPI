const catchAsync = require("../utils/catchAsync");
const Payment = require("../models/payment.model");
const AppError = require("../utils/AppError");

const checkIfUserIsSubscribed = catchAsync(async (req, res, next) => {
  const { email } = req.user;

  const paymentRecord = await Payment.findOne({ email, status: "success" });

  if (!paymentRecord) {
    return next(
      new AppError(
        "You are not currently a premium user and can't access this service"
      )
    );
  }

  next();
});

module.exports = { checkIfUserIsSubscribed };
