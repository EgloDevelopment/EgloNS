const express = require("express");
const app = express();
const mongodb_init = require(__dirname + "/mongodb");
const mongoSanitize = require("express-mongo-sanitize");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(mongoSanitize());
app.use(cors());
app.use(cookieParser());

mongodb_init();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

const magic = require("express-routemagic");
magic.use(app);

app.listen(5000, () => {
  console.log(`Eglo Notification Service listening on port 5000`);
});