const Company = require("../models/company.model");

const createCompany = async function (companyData) {
  const company = await Company.create(companyData);
  return company;
};

const getCompanyById = async function (companyId) {
  const company = await Company.findById(company).populate("user");
  return company;
};

const updateCompany = async function (companyId, companyData) {
  const company = await Company.findByIdAndUpdate(companyId, companyData, {
    new: true,
  });
  return company;
};

const deleteCompany = async function (companyId) {
  const company = await Company.findByIdAsndDelete(companyId);
  return company;
};

module.exports = {
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
