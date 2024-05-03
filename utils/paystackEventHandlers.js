const Payment = require("./../models/payment.model");

async function handleChargeSuccessOrSubscriptionCreate(event) {
  const { data } = event;
  const { reference, amount } = data;
  const { email, customer_code } = data?.customer;
  const { plan_code } = data?.plan;
  console.log("Event is: ", event);

  const exisitingPayment = await Payment.findOne({
    reference: reference,
    customerCode: customer_code,
    planCode: plan_code,
    email,
  });

  if (exisitingPayment) {
    // exisitingPayment.status == "success", await exisitingPayment.save();
    return;
  }

  const payment = await Payment.create({
    email,
    amount,
    planCode: plan_code,
    customerCode: customer_code,
    reference: reference,
    status: "success",
  });
  console.log("Payment is: ", payment);

  console.log("Payment successful for", event);
}

async function handleChargeFailed(event) {
  const { data } = event;
  const { reference } = data;
  const payment = await Payment.findOne({ reference });
  if (payment) {
    payment.status = "failed";
    await payment.save();
  }
}

const eventHandlers = {
  "charge.success": handleChargeSuccessOrSubscriptionCreate,
  "subscription.create": handleChargeSuccessOrSubscriptionCreate,
  "charge.failed": handleChargeFailed,
  // Add more event handlers as needed
};

module.exports = eventHandlers;
