const express = require("express");
const contactRouter = require("./contacts");
const signupRouter = require("./signup");
const loginRouter = require("./login");
const usersRouter = require("./users");

const router = express.Router();

router.use("/api/contacts", contactRouter);
router.use("/users/signup", signupRouter);
router.use("/users/login", loginRouter);
router.use("/users", usersRouter);

module.exports = router;
