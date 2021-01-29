const Auths = require("../auth/auth-model");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/secret");

function validateRegister(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json("username and password required");
  } else if (!req.body.username || !req.body.password) {
    res.status(400).json("username and password required");
  } else {
    next();
  }
}

function checkExistingUser(req, res, next) {
  Auths.findByUsername(req.body.username).then((user) => {
    if (!user) {
      next();
    } else {
      res.status(400).json("username taken");
    }
  });
}

function handleErrors(error, req, res, next) {
  res.status(500).json({
    info: "There was an error in the router",
    message: error.message,
    stack: error.stack,
  });
}

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = {
  handleErrors,
  validateRegister,
  checkExistingUser,
  generateToken,
};
