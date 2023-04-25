const { User, hashPassword } = require("../models/user");
const gravatar = require("gravatar");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const createUser = async (password, email, subscription, avatarURL, token) => {
  try {
    const hashedPassword = hashPassword(password);
    const createAvatar = gravatar.url(email, { d: "robohash", s: "250" });

    const user = new User({
      password: hashedPassword,
      email,
      subscription,
      avatarURL: createAvatar,
      verify: false,
      verificationToken: uuidv4(),
      token,
    });

    await user.save();

    await sendVerificationEmail(user.email, user.verificationToken);

    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

const getUserById = async (_id) => {
  const user = await User.findOne({ _id });
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const addUserToken = async (id, token) => {
  return User.findByIdAndUpdate(id, { token });
};

const updateUserToken = async (_id) => {
  return User.findOneAndUpdate(_id, { token: null });
};

const updateAvatar = async (email, avatarURL) => {
  const user = await User.findOneAndUpdate(
    { email },
    { avatarURL },
    { new: true }
  );
  return user;
};

const verifyUser = async (verificationToken) => {
  const user = await User.findOneAndUpdate(
    { verificationToken },
    { verify: true, verificationToken: null },
    { new: true }
  );
  return user;
};

const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const auth = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth,
    });

    const html = `
      <div>
        <p>Click <a href="http://localhost:3000/api/users/verify/${verificationToken}">here</a> to verify your account</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: { name: "Piotr", address: "example@example.com" },
      to: email,
      subject: "Verify your account",
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(previewUrl);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  addUserToken,
  updateUserToken,
  getUserByEmail,
  updateAvatar,
  verifyUser,
  sendVerificationEmail,
};
