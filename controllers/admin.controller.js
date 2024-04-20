const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  createNewUser,
  getUserByEmail,
  getUserById,
  updateUserById,
  getUsers,
  deleteUser,
} = require("../repositories/user");
const {
  validateSuperAdminRegistration,
  validateAdminRegistration,
  validateAdminLogin,
} = require("../validations/admin");
const { signJWTToken } = require("../utils/jwt");
const {
  createVerificationTokenAndSendToEmail,
} = require("../utils/createVerificationToken");
const sendEmail = require("../utils/email");
const filterObj = require("../utils/filterObj");

// Create SuperAdmin
const createSuperAdmin = catchAsync(async (req, res, next) => {
  const { firstname, lastname, email, password, phoneNumber } = req.body;

  const validation = validateSuperAdminRegistration({
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
    role: "superadmin",
  });

  if (validation.error) {
    return next(new AppError(validation.error.message, 404));
  }

  const adminExists = await getUserByEmail(email);
  if (adminExists) {
    return next(
      new AppError(
        "User with the specified email already exists and cannot be made a superadmin",
        404
      )
    );
  }

  const newSuperAdmin = await createNewUser({
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
    role: "superadmin",
  });

  if (!newSuperAdmin) {
    return next(new AppError("Failed to create superadmin", 404));
  }

  const hashedVerificationToken = createVerificationTokenAndSendToEmail(
    req,
    newSuperAdmin
  );

  const superadmin = await updateUserById(newSuperAdmin._id, {
    verificationToken: hashedVerificationToken,
  });

  const token = signJWTToken(superadmin._id);
  res
    .cookie("admin_token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    })
    .status(200)
    .json({
      status: "success",
      data: superadmin,
    });
});

// Create Admin
// Protected for superadmin
const createAdmin = catchAsync(async (req, res, next) => {
  const { firstname, lastname, email, password, phoneNumber } = req.body;

  const validation = validateAdminRegistration({
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
    role: "admin",
  });

  if (validation.error) {
    return next(new AppError(validation.error.message, 404));
  }

  const adminExists = await getUserByEmail(email);
  if (adminExists) {
    return next(
      new AppError(
        "User with the specified email already exists and cannot be made an admin",
        404
      )
    );
  }

  const newAdmin = await createNewUser({
    firstname,
    lastname,
    email,
    password,
    phoneNumber,
    role: "admin",
  });

  if (!newAdmin) {
    return next(new AppError("Failed to create admin", 404));
  }

  const hashedVerificationToken = createVerificationTokenAndSendToEmail(
    req,
    newAdmin
  );

  const admin = await updateUserById(newAdmin._id, {
    verificationToken: hashedVerificationToken,
  });

  sendEmail({
    email: admin.email,
    subject: "Admin Account Created for Synconference",
    message: `An admin account has been created for you. Please check your inbox to verify your email address to activate your account . Your password is ${password}`,
  });

  res.status(200).json({
    status: "success",
    message: "Admin created successfully",
    data: admin,
  });
});

// Login Admin
const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const validation = validateAdminLogin({ email, password });

  if (validation.error) {
    return next(new AppError(validation.error.message, 404));
  }

  const admin = await getUserByEmail(email).select("+password");
  console.log(admin);
  if (!admin) {
    return next(new AppError("Invalid email or password", 404));
  }

  if (!admin.emailVerified) {
    return next(new AppError("Please verify your email address", 404));
  }

  if (!(await admin.confirmPassword(password, admin.password))) {
    return next(new AppError("Invalid email or password", 404));
  }

  delete admin.password;
  const token = signJWTToken(admin._id);
  res
    .cookie("admin_token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    })
    .status(200)
    .json({
      status: "success",
      data: admin,
    });
});

// Get All Users
// Protected for admin route
const getAllUsers = catchAsync(async (req, res, next) => {
  const admin = req.admin;
  let users;

  users = await getUsers();
  console.log(admin);
  console.log(admin.role, "admin role");
  if (admin.role !== "superadmin") {
    users = users.filter((user) => user.role !== "superadmin");
  }

  if (!users) {
    return next(new AppError("Failed to fetch all users", 404));
  }

  res.status(200).json({
    result: users.length,
    status: "success",
    message: "All users gotten successfully",
    data: users,
  });
});

// Update Admin Profile
// Protected for admin route
const updateAdminProfile = catchAsync(async (req, res, next) => {
  const adminID = req.admin._id;

  console.log(req.body);
  if (Object.keys(req.body).length === 0) {
    return next(new AppError("Please fill in the fields to update", 404));
  }

  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password update, please use the correct route if you want to update passwordx",
        404
      )
    );
  }
  const allowedFields = filterObj(
    req.body,
    "firstname",
    "lastname",
    "phoneNumber"
  );

  const user = await updateUserById(adminID, allowedFields);

  if (!user) {
    return next(new AppError("Failed to update admin details", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Admin details updated successfully",
    data: {
      user,
    },
  });
});

// Delete User
// Protected for admin route
const deleteUserAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await getUserById(id);
  if (user.role === "admin" || user.role === "superadmin") {
    return next(
      new AppError(
        "This route is not for admin account deleteion. Please use the admin route for admin account deletion",
        401
      )
    );
  }
  await deleteUser(id);
  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

// Delete Admin account
// Protected for superadmin route
const deleteAdminAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await getUserById(id);
  if (user.role === "superadmin") {
    return next(
      new AppError("You can't delete a superadmin using this route!", 401)
    );
  }
  await deleteUser(id);
  res.status(200).json({
    status: "success",
    message: "Admin deleted successfully",
  });
});

module.exports = {
  createSuperAdmin,
  createAdmin,
  adminLogin,
  getAllUsers,
  deleteUserAccount,
  deleteAdminAccount,
  updateAdminProfile,
};
