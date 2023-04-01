const bcrypt = require("bcrypt");

const { getUserByEmail, addUserToken } = require("../controllers/users");
const issueToken = require("./issueToken");

const loginHandler = async (email, incomingPassword) => {
  const user = await getUserByEmail(email);
  const userPassword = user.password;
  const result = bcrypt.compareSync(incomingPassword, userPassword);
  if (result) {
    const token = issueToken(user);
    await addUserToken(user._id, token);
    return token;
  } else {
    throw "Invalid credentials";
  }
};

module.exports = loginHandler;
