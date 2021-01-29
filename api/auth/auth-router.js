const bcryptjs = require("bcryptjs");
const router = require("express").Router();
const Auths = require("./auth-model");

const {
  validateRegister,
  handleErrors,
  checkExistingUser,
  generateToken,
} = require("../middleware/router-middleware");
const { userParams } = require("../../data/dbConfig");

router.post(
  "/register",
  validateRegister,
  checkExistingUser,
  (req, res, next) => {
    const hash = bcryptjs.hashSync(req.body.password, 8);
    req.body.password = hash;

    Auths.add(req.body)
      .then((user) => {
        res.status(200).json(user);
      })
      .catch(next);
  }
);

router.post("/login", validateRegister, (req, res, next) => {
  Auths.findByUsername(req.body.username).then((user) => {
    if (user && bcryptjs.compareSync(req.body.password, user.password)) {
      const token = generateToken(user);
      res.status(200).json({ message: `welcome, ${user.username}`, token });
    } else {
      res.status(401).json("invalid credentials");
    }
  });
});

router.use(handleErrors);

module.exports = router;
