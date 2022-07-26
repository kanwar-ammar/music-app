const User = require("../models/userModel");

async function signup(req, res) {
  try {
    const { name, password, email } = req.body;
    const user = new User({
      name: name,
      password: password,
      email: email,
    });
    user.save((err, user) => {
      if (!err) {
        res.status(200).json({
          user,
        });
      } else {
        res.status(400).send(err.message);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

async function login(req, res) {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name: name });
    if (user) {
      if (user.password === password) {
        return res.status(200).json({
          message: "You are successfully logged in",
          data: user,
        });
      } else {
        return res.status(401).send("Wrong password");
      }
    }
    return res.status(400).send("No user exists with this name");
  } catch (err) {
    console.log(err);
  }
}

async function getAllUsers(req, res) {
  const allUsers = await User.find().populate("spotifyId");
  console.log(allUsers);
  res.status(200).json({
    data: allUsers,
  });
}

module.exports = { signup, login, getAllUsers };
