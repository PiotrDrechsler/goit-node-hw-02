const express = require("express");

const { auth } = require("../auth/auth");
const { User } = require("../models/user");
const { userValidationSchema } = require("../models/user");

const {
  getUserById,
  getUserByEmail,
  getAllUsers,
  addUserToken,
  updateUserToken,
} = require("../controllers/users");

const router = express.Router();

router.get("/logout", auth, async (req, res) => {
  try {
    const { _id } = await req.user;
    const user = await getUserById({ _id });
    if (!user) {
      return res.status(401).send("Not authorized");
    }
    await updateUserToken(_id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
