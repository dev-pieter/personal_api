var mongoUriBuilder = require("mongo-uri-builder");
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");

dotenv.config();

const mongo_pwd = process.env.DB_PASS;
const mongo_user = process.env.DB_USER;
const dbName = "blog";

const url = mongoUriBuilder({
  username: encodeURIComponent(mongo_user), // or user: 'user'
  password: encodeURIComponent(mongo_pwd),
  host: "178.128.168.53",
  port: 27017,
});

var db;

const connect_db = () => {
  MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err);

    db = client.db(dbName);
    console.log(`Connected MongoDB`);
    console.log(`Database: ${dbName}`);
  });
};

const get_db = () => {
    return db;
};

module.exports = { connect_db, get_db };
