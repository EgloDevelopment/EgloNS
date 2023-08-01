const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ service: "ENS", status: "UP"});
});

module.exports = router;