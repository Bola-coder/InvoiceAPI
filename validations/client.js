const joi = require("joi");

const validateClientCreation = (client) => {
  const schema = joi.object().keys({
    name: joi
      .string()
      .required()
      .error(new Error("Please provide a client name")),
    email: joi
      .string()
      .email()
      .required()
      .error(new Error("Please provide a valid client email")),
    address: joi
      .string()
      .required()
      .error(new Error("Please provide a client address")),
    phoneNumber: joi
      .string()
      .required()
      .error(new Error("Please provide a client phone number")),
  });

  return schema.validate(client);
};

const validateClientUpdate = (client) => {
  const schema = joi.object().keys({
    name: joi.string().error(new Error("Please provide a client name")),
    email: joi
      .string()
      .email()
      .error(new Error("Please provide a valid client email")),
    address: joi.string().error(new Error("Please provide a client address")),
    phoneNumber: joi
      .string()
      .error(new Error("Please provide a client phone number")),
    arhived: joi
      .boolean()
      .error(new Error("Please provide a valid archived status")),
  });
  return schema.validate(client);
};
module.exports = {
  validateClientCreation,
  validateClientUpdate,
};
