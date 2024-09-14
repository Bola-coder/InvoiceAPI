const joi = require("joi");

const validateCompanyCreation = (obj) => {
  const schema = joi.object().keys({
    name: joi
      .string()
      .required()
      .error(() => new Error("Please provide the company name")),
    address: joi
      .string()
      .required()
      .error(() => Error("Please provide the company address")),
    email: joi
      .string()
      .email()
      .required()
      .error(() => new Error("Please provide the company's email")),
    phoneNumber: joi
      .string()
      .required()
      .error(() => Error("Please provide the company address")),
    currency: joi
      .string()
      .required()
      .error(() => Error("Please provide the company's currency")),
    logo: joi.string().error(() => Error("Please provide the company address")),
  });
  return schema.validate(obj);
};

module.exports = { validateCompanyCreation };
