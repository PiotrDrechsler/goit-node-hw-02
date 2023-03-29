const express = require("express");
const contactRouter = require("./contacts");
const signupRouter = require("./signup");

const router = express.Router();

router.use("/api/contacts", contactRouter);
router.use("/users/signup", signupRouter);

module.exports = router;
