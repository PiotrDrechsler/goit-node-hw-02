const express = require("express");

const loginHandler = require("../auth/loginHandler");
const { getUserByEmail } = require("../controllers/users");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(400).send("User not found!!!");
  }
  try {
    const token = await loginHandler(email, password);
    return res.status(200).send(token);
  } catch (err) {
    return res.status(401).send("Email or password is wrong");
  }
});

module.exports = router;
