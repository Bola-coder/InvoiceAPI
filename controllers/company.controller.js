const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../repositories/company");
const { validateCompanyCreation } = require("./../validations/company");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { uploader } = require("./../utils/cloudinary");
const { dataUri } = require("./../utils/multer");

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

const uploadCompanyLogo = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user.id;
  if (!companyId) {
    return next(
      new AppError(
        "Please provide the id of the company you want to update",
        400
      )
    );
  }
  if (!req.file) {
    return next(new AppError("Please upload an image for the logo", 400));
  }

  console.log(companyId);
  console.log(userId);
  const company = await getCompanyById(userId, companyId);
  console.log("Company is: ", company);

  if (!company) {
    return next(
      new AppError("Failed to find company with the specified id for user")
    );
  }

  const file = dataUri(req).content;

  try {
    const result = await uploader.upload(file, {
      folder: `InvoiceAPI/companies/${company.email}/logo`,
      use_filename: true,
    });
    const logo = result.secure_url;
    company.logo = logo;
    await company.save();
    res.status(200).json({
      status: "success",
      message: "Company logo updated successfully",
      data: {
        company,
      },
    });
  } catch (error) {
    return next(
      new AppError(
        `Error while uploading profile picture with message: ${error.message}`,
        404
      )
    );
  }
});

// get all companies
const getAllCompanies = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companies = await getCompanies(userId);

  if (!companies) {
    return next(new AppError("Companies not found", 404));
  }

  res.status(200).json({
    status: "success",
    result: companies.length,
    message: "Companies retrieved successfully",
    data: {
      companies,
    },
  });
});

// Get comapny by id
const getComapnyDetails = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companyId = req.params.companyId;

  const company = await getCompanyById(userId, companyId);

  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Company retrieved successfully",
    data: {
      company,
    },
  });
});

// Update company
const updateCompanyDetails = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companyId = req.params.companyId;

  if (!companyId) return next(new AppError("Company ID is required", 400));

  const company = await getCompanyById(userId, companyId);

  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  const allowedFields = filterObj(
    req.body,
    "name",
    "address",
    "email",
    "phone",
    "website"
  );

  const updatedCompany = await updateCompany(companyId, allowedFields);

  if (!updatedCompany) {
    return next(new AppError("Company not updated", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Company updated successfully",
    data: {
      company: updatedCompany,
    },
  });
});

// Delete company
const deleteCompanyRecord = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const companyId = req.params.companyId;

  if (!companyId) return next(new AppError("Company ID is required", 400));

  const company = await getCompanyById(userId, companyId);

  if (!company) {
    return next(new AppError("Company not found", 404));
  }

  await deleteCompany(companyId);

  res.status(200).json({
    status: "success",
    message: "Company deleted successfully",
    data: null,
  });
});

module.exports = {
  createNewCompany,
  uploadCompanyLogo,
  getAllCompanies,
  getComapnyDetails,
};
