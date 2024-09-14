const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const request = require("request");
const Payment = require("../models/payment.model");
const crypto = require("crypto");
const eventHandlers = require("./../utils/paystackEventHandlers");
const { initializePayment, verifyPayment } =
  require("../config/paystack")(request);

const createNewSubscription = catchAsync(async (req, res, next) => {
  let planCode = "";
  const { amount, subscriptionType } = req.body;
  const { email } = req.user;
  planCode = process.env.PAYSTACK_MONTHLY_PLAN_CODE;
  console.log(planCode);
  const form = { email, amount, plan: planCode };
  const callback = async (error, body) => {
    if (error) {
      return next(new AppError(error, 400));
    }
    if (body.status === false) {
      return next(new AppError("Failed to initialize payment", 400));
    }
    // console.log(body);
    return res.status(200).json({
      status: "success",
      message: "Payment initialized",
      data: JSON.parse(body),
    });
  };
  initializePayment(form, callback);
});

const verifySubscription = catchAsync(async (req, res, next) => {
  const ref = req.params.reference;
  const callback = (error, body) => {
    if (error) {
      return next(new AppError(error, 400));
    }
    return res.status(200).json({
      status: "success",
      message: "Payment verified",
      data: JSON.parse(body),
    });
  };
  verifyPayment(ref, callback);
});

// Create a paystack webhook to handle subscription
const paystackWebHook = catchAsync(async (req, res, next) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = req.headers["x-paystack-signature"];
  const event = req.body;
  console.log(req.body);
  const verifyWebhook = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash === verifyWebhook) {
    // console.log("The event from the webhook is: ", event);
    const eventHandler = eventHandlers[event.event];
    if (eventHandler) {
      await eventHandler(event);
    } else {
      console.log("Unhandled event: ", event.event);
    }
  } else {
    console.log("Webhook wouldn't work because you are unAuthenticated");
    return next(new AppError("Invalid webhook secret", 401));
  }
});

// Check subscribtion status
const checkSubscriptionStatus = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide user email address"));
  }

  const payment = await Payment.findOne({ email });

  if (!payment) {
    return next(
      new AppError(
        "You are not subscribed to the premium service. Please subscribe to use this service"
      )
    );
  }

  if (payment.status !== "success") {
    return next(
      new AppError(
        "Your subscription to the premium service has ended. Please subscribe again"
      )
    );
  }

  res.status(200).json({
    status: "success",
    messahe: "You are currently subscribed to the premium services",
  });
});

module.exports = {
  createNewSubscription,
  verifySubscription,
  paystackWebHook,
  checkSubscriptionStatus,
};
