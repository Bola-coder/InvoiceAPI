const joi = require("joi");

const validateSuperAdminRegistration = (obj) => {
  const schema = joi.object().keys({
    firstname: joi
      .string()
      .required()
      .error(() => new Error("Please provide first name")),
    lastname: joi
      .string()
      .required()
      .error(() => new Error("Please provide last name")),
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required()
      .error(() => new Error("Please provide a valid email address")),
    password: joi
      .string()
      .min(7)
      .required()
      .error(
        () => new Error("Please provide a password not less than 8 characters")
      ),
    phoneNumber: joi
      .string()
      .required()
      .error(() => new Error("Please provide a valid phone number")),
    role: joi
      .string()
      .required()
      .equal("superadmin")
      .error(() => new Error("Role must be superadmin")),
  });

  return schema.validate(obj);
};

const validateAdminRegistration = (obj) => {
  const schema = joi.object().keys({
    firstname: joi
      .string()
      .required()
      .error(() => new Error("Please provide first name")),
    lastname: joi
      .string()
      .required()
      .error(() => new Error("Please provide last name")),
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required()
      .error(() => new Error("Please provide a valid email address")),
    password: joi
      .string()
      .min(7)
      .required()
      .error(
        () => new Error("Please provide a password not less than 8 characters")
      ),
    phoneNumber: joi
      .string()
      .required()
      .error(() => new Error("Please provide a valid phone number")),
    role: joi
      .string()
      .required()
      .equal("admin")
      .error(() => new Error("Role must be admin")),
  });
  return schema.validate(obj);
};

const validateAdminLogin = (obj) => {
  const schema = joi.object().keys({
    email: joi
      .string()
      .email({ tlds: { allow: false } })
      .required()
      .error(() => new Error("Please provide a valid email address")),
    password: joi
      .string()
      .required()
      .error(() => new Error("Please provide your password")),
  });
  return schema.validate(obj);
};

module.exports = {
  validateSuperAdminRegistration,
  validateAdminRegistration,
  validateAdminLogin,
};
