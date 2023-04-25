const express = require("express");
const contactRouter = require("./contacts");
const usersRouter = require("./users");

const router = express.Router();

router.use("/api/contacts", contactRouter);
router.use("/api/users", usersRouter);

module.exports = router;
