const express = require("express");
const { createUser, getUserByEmail } = require("../controllers/users");
const { userValidationSchema } = require("../models/user");

const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = userValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const { password, email, subscription } = req.body;
    const isEmailOccupied = await getUserByEmail(email);
    if (isEmailOccupied) {
      return res.status(409).send(`Email ${email} is already in use!`);
    }
    const user = await createUser(password, email, subscription);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).send("Something went wrong POST!");
  }
});

module.exports = router;
