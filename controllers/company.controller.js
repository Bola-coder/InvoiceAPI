const {
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../repositories/company");
const { validateCompanyCreation } = require("./../validations/company");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const createNewCompany = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const { error } = validateCompanyCreation(req.body);

  if (error) {
    return next(new AppError(`Validation Error: ${error.message}`, 404));
  }

  const data = {
    ...req.body,
    user: userId,
  };

  const company = await createCompany(data);

  if (!company) {
    return next(new AppError("Failed to create new company", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Company created successfully",
    data: {
      company,
    },
  });
});

module.exports = { createNewCompany };
