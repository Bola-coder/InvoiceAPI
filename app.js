const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const adminRoutes = require("./routes/admin.route");
const invoiceRoutes = require("./routes/invoice.route");
const clientRoutes = require("./routes/client.route");
const companyRoutes = require("./routes/company.route");
const paymentRoutes = require("./routes/payment.route");
const invoicePaymentRoutes = require("./routes/invoicePayment.route");
const AppError = require("./utils/AppError");
const { cloudinaryConfig } = require("./utils/cloudinary");

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://swyftinvoice.netlify.app/login",
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("*", cloudinaryConfig);
const appName = "InvoiceAPI";

// req.isAuthenticated is provided from the auth router
app.get("/", (req, res) => {
  res.json({
    message: `Welcome to ${appName}`,
  });
});

app.get("/api/v1", (req, res) => {
  res.json({
    message: `Welcome to ${appName} API`,
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/invoicePayment", invoicePaymentRoutes);
app.all("*", (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} using http method ${req.method} on this server. Route not defined`,
    404
  );
  next(error);
});

app.use(errorHandler);

module.exports = app;
