const { User, hashPassword } = require("../models/user");
const gravatar = require("gravatar");

const createUser = async (password, email, subscription, avatarURL, token) => {
  const hashedPassword = hashPassword(password);
  const createAvatar = gravatar.url(email, { d: "robohash", s: "250" });

  const user = new User({
    password: hashedPassword,
    email,
    subscription,
    avatarURL: createAvatar,
    token,
  });
  user.save();
  return user;
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  addUserToken,
  updateUserToken,
  getUserByEmail,
};
