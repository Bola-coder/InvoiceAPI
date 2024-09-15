const Company = require("../models/company.model");

const createCompany = async function (companyData) {
  const company = await Company.create(companyData);
  return company;
};

const getCompanies = async function (userId) {
  const companies = await Company.find({ user: userId }).populate([
    "user",
    "invoices",
    "clients",
  ]);
  return companies;
};

const getCompanyById = async function (userId, companyId) {
  const company = await Company.findOne({
    _id: companyId,
    user: userId,
  })
    .populate("user")
    .populate({
      path: "invoices",
      populate: {
        path: "client",
      },
    })
    .populate("clients");
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
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
