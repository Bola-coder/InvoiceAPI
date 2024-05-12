const joi = require("joi");

// Validation for the invoice creation
const validateInvoiceCreation = (obj) => {
  const schema = joi.object().keys({
    invoiceNumber: joi
      .string()
      .required()
      .error(() => new Error("Please provide an invoice number")),
    client: joi
      .string()
      .required()
      .error(() => new Error("Please provide a client id")),
    invoiceDate: joi
      .date()
      .required()
      .error(() => new Error("Please provide an invoice date")),
    dueDate: joi
      .date()
      .required()
      .error(() => new Error("Please provide a due date")),
    items: joi
      .array()
      .items(
        joi.object().keys({
          itemName: joi
            .string()
            .required()
            .error(() => new Error("Please provide an item name")),
          quantity: joi
            .number()
            .required()
            .error(() => new Error("Please provide a quantity")),
          price: joi
            .number()
            .required()
            .error(() => new Error("Please provide a price")),
        })
      )
      .required()
      .error(() => new Error("Please provide an item")),
    //   Total is not required because it can be calculated from the items
    total: joi.number().error(() => new Error("Please provide a total")),
  });
  return schema.validate(obj);
};

// Validation for the invoice update
const validateInvoiceUpdate = (obj) => {
  const schema = joi.object().keys({
    invoiceNumber: joi
      .string()
      .error(() => new Error("Please provide an invoice number")),
    client: joi.string().error(() => new Error("Please provide a client id")),
    invoiceDate: joi
      .date()
      .error(() => new Error("Please provide an invoice date")),
    dueDate: joi.date().error(() => new Error("Please provide a due date")),
    items: joi
      .array()
      .items(
        joi.object().keys({
          itemName: joi
            .string()
            .error(() => new Error("Please provide an item name")),
          quantity: joi
            .number()
            .error(() => new Error("Please provide a quantity")),
          price: joi.number().error(() => new Error("Please provide a price")),
        })
      )
      .error(() => new Error("Please provide an item")),
    total: joi.number().error(() => new Error("Please provide a total")),
    status: joi
      .string()
      .valid("draft", "sent", "not-paid", "partially-paid", "paid")
      .error(() => new Error("Invalid status")),
    amountPaid: joi.number().error(() => new Error("Please provide an amount")),
  });
  return schema.validate(obj);
};

module.exports = { validateInvoiceCreation, validateInvoiceUpdate };
