const { MongoClient } = require("mongodb");
var config = require('./config');
const url = config.connectionString;
var client = new MongoClient(url);


async function getClient() {
    try {
        client = new MongoClient(url);
        await client.connect();
        console.log("Connected correctly to server");
        return client;
    } catch (err) {
        console.log(err.stack);
        return null
    }
}


module.exports = { getClient };
