const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const nodemailer = require("nodemailer");

const { auth } = require("../auth/auth");
const loginHandler = require("../auth/loginHandler");
const { userValidationSchema } = require("../models/user");

const {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserToken,
  updateAvatar,
} = require("../controllers/users");

const createFolderIfNotExist = require("../helpers/helpers");

const router = express.Router();

const storeImage = path.join(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storeImage);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: 1048576,
});

const upload = multer({ storage });

router.post("/signup", async (req, res) => {
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

router.post("/login", async (req, res) => {
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

router.get("/current", auth, async (req, res, next) => {
  const { id } = req.user;
  const user = await getUserById(id);
  if (!user) {
    return res.status(401).json({ message: "Not authorized" });
  } else {
    const userData = {
      email: user.email,
      subscription: user.subscription,
    };
    res.status(200).json(userData);
  }
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { email } = req.user;
      const { path: temporaryName, originalname } = req.file;
      const timestamp = Date.now();
      const datestamp = new Date(timestamp).toISOString().slice(0, 10);
      const fileName = path.join(
        storeImage,
        `${email}-${datestamp}-${timestamp}-${originalname}`
      );
      await fs.rename(temporaryName, fileName);
      const img = await Jimp.read(fileName);
      await img.autocrop().cover(250, 250).quality(60).writeAsync(fileName);
      const avatarURL = path.join(
        process.cwd(),
        "public/avatars",
        `${email}-${datestamp}-${timestamp}-${originalname}`
      );
      const cleanAvatarURL = avatarURL.replace(/\\/g, "/");
      const user = await updateAvatar(email, cleanAvatarURL);
      await fs.rename(
        fileName,
        path.join(
          process.cwd(),
          "public/avatars",
          `${email}-${datestamp}-${timestamp}-${originalname}`
        )
      );
      res.status(200).json(user);
    } catch (error) {
      next(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
