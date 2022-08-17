const User = require("../models/userModel");
const Joi = require("joi");

async function signup(req, res) {
  try {
    let data = await req.body;
    const schema = Joi.object({
      name: Joi.string()
        .regex(/^[^\s]+$/)
        .required()
        .min(5),
      email: Joi.string().email(),
      password: Joi.string().min(8).required(),
    });
    const value = await schema.validateAsync(data);
    console.log(value);
    if (!value.error) {
      const { name, password, email } = req.body;
      const userNameDb = await User.findOne({ name });
      const userEmailDb = await User.findOne({ email });
      if (userNameDb) {
        return res.status(400).json({
          message: "username already in use",
          error: true,
        });
      }
      if (userEmailDb) {
        return res.status(400).json({
          message: "email already in use",
          error: true,
        });
      }
      console.log("no user found in data base");
      const user = new User({
        name: name,
        password: password,
        email: email,
      });
      return user.save((err, user) => {
        if (!err) {
          return res.status(200).json({
            message: "user registered successfully",
            data: user,
          });
        } else {
          return res.status(400).send(err.message);
        }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message,
      error: true,
    });
  }
}

async function login(req, res) {
  try {
    let data = await req.body;
    const schema = Joi.object({
      name: Joi.string()
        .required()
        .trim()
        .regex(/^[^\s]+$/),
      password: Joi.string().min(8).required(),
    });
    const value = await schema.validateAsync(data);
    if (!value.error) {
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
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message,
      error: true,
    });
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
