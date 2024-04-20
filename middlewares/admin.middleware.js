const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { getUserById } = require("../repositories/user");

const protectAdminRoute = catchAsync(async (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) {
    return next(
      new AppError(
        "You are currently not logged in. Please sign in to continue",
        401
      )
    );
  }

  // Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Checking if user still exists
  const id = decoded.id;
  const currentUser = await getUserById(id);
  if (!currentUser) {
    return next(
      new AppError("The user with the token does not exist anymore", 401)
    );
  }

  // Checking if user hasn't changed password since the token was last issued
  if (!currentUser.passwordChangedAfterTokenIssued(decoded.iat)) {
    return next(
      new AppError(
        "Password has been changed. Please login to get a new token"
      ),
      401
    );
  }

  // Checks if the role supplied is a supperadmin and if yes, checks if the logged user is a superadmin
  // if (role === "superadmin" && !(currentUser.role === "superadmin")) {
  //   return next(
  //     new AppError(
  //       "You are not authorised to access this route. Only the super admins can",
  //       401
  //     )
  //   );
  // }

  // If everything checks out
  req.admin = currentUser;
  next();
});

const checkIfIsSuperAdmin = catchAsync(async (req, res, next) => {
  if (req.admin.role !== "superadmin") {
    return next(
      new AppError(
        "You are not authorised to access this route. Only the super admins can",
        401
      )
    );
  }
  next();
});

module.exports = { protectAdminRoute, checkIfIsSuperAdmin };
