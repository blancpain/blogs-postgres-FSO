const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, Session } = require("../models");

router.post("/", async (req, res) => {
  const body = req.body;
  const { SECRET } = require("../utils/config");

  const user = await User.findOne({
    where: {
      username: body.username,
    },
  });

  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: "invalid username or password" });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);
  await Session.create({ session: token, userId: user.id });

  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = router;
