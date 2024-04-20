const {
  createClient,
  getClientsForUser,
  getClientById,
  updateClient,
  deleteClient,
} = require("../repositories/client");
const {
  validateClientCreation,
  validateClientUpdate,
} = require("../validations/client");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { object } = require("joi");

const createNewClient = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { error } = validateClientCreation(req.body);
  if (error) {
    return next(new AppError(`Validation Error: ${error.message}`, 400));
  }

  const clientData = {
    ...req.body,
    user: req.user._id,
  };

  const client = await createClient({
    user: userId,
    ...clientData,
  });

  if (!client) {
    return next(new AppError("Client not created", 400));
  }

  res.status(201).json({
    status: "success",
    message: "Client created successfully",
    data: {
      client,
    },
  });
});

const getAllClientsForUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const clients = await getClientsForUser(userId);

  if (!clients) {
    return next(new AppError("No clients found", 404));
  }

  res.status(200).json({
    status: "success",
    result: clients.length,
    message: "Clients retrieved successfully",
    data: {
      clients,
    },
  });
});

const getClientDetails = catchAsync(async (req, res, next) => {
  const { clientId } = req.params;

  if (!clientId) {
    return next(new AppError("Client Id not provided", 400));
  }

  const userId = req.user.id;
  console.log(clientId, userId);
  const client = await getClientById(clientId, userId);
  console.log(client);

  if (!client) {
    return next(new AppError("Client not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Client details retrieved successfully",
    data: {
      client,
    },
  });
});

const updateClientDetails = catchAsync(async (req, res, next) => {
  const clientId = req.params.clientId;
  const userId = req.user._id;
  const clientData = req.body;

  if (!clientId) {
    return next(new AppError("Client Id not provided", 400));
  }

  if (!Object.keys(clientData).length) {
    return next(new AppError("Please provide data to update", 400));
  }

  const { error } = validateClientUpdate(clientData);
  if (error) {
    return next(new AppError(`Validation Error: ${error.message}`, 400));
  }

  const client = await updateClient(clientId, userId, clientData);

  if (!client) {
    return next(new AppError("Client not updated", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Client updated successfully",
    data: {
      client,
    },
  });
});

const removeClient = catchAsync(async (req, res, next) => {
  const clientId = req.params.clientId;
  const client = await getClientById(clientId, req.user._id);

  if (!client) {
    return next(new AppError("Client not found", 404));
  }

  const deletedClient = await deleteClient(clientId);

  if (!deletedClient) {
    return next(new AppError("Client not deleted", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Client deleted successfully",
    data: null,
  });
});

module.exports = {
  createNewClient,
  getAllClientsForUser,
  getClientDetails,
  updateClientDetails,
  removeClient,
};
