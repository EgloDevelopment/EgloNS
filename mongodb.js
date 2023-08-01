require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const mongoDbUrl = process.env.MONGODB_URL;

let client;

module.exports = async () => {
  try {
    client = await MongoClient.connect(mongoDbUrl, { useNewUrlParser: true });
    console.log("Connected to mongodb");
  } catch (e) {
    console.log("Could not connect to mongodb");
  }
};

module.exports.get = () => client;

module.exports.close = () => client.close();