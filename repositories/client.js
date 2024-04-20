const Client = require("../models/client.model");

const createClient = async (clientData) => {
  const client = await Client.create(clientData);
  return client;
};

const getClientsForUser = async (userId) => {
  const clients = await Client.find({ user: userId });
  return clients;
};

const getClientById = async (clientId, userId) => {
  const client = await Client.findOne({ _id: clientId, user: userId });
  return client;
};

const updateClient = async (clientId, userId, clientData) => {
  const client = await Client.findOneAndUpdate(
    { _id: clientId, user: userId },
    clientData,
    {
      new: true,
    }
  );
  return client;
};

const deleteClient = async (clientId) => {
  const client = await Client.findByIdAndDelete(clientId);
  return client;
};

module.exports = {
  createClient,
  getClientById,
  getClientsForUser,
  updateClient,
  deleteClient,
};
