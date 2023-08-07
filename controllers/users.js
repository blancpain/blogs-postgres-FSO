const router = require("express").Router();
const bcrypt = require("bcrypt");

const { User, Blog } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    attributes: {
      exclude: ["passwordHash", "createdAt", "updatedAt"],
    },
    include: {
      model: Blog,
      attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
    },
  });
  res.json(users);
});

/*

Personal notes on the below - it seems sequelize "knows" about the connections table
and the many-to-many relationship between Users and Blogs
through the ReadingList connections table and automatically executes a join query even if no "as" is specified.
With "as" we can introduce an alias as set up in the DB sync options(models/index.js).

In the "through" field we can specify fields from the actual connections table.

If we directly specify model: ReadingList it won't work because there is no direct connection between users and ReadingList - there is a connection
between users and blogs THROUGH ReadingList

*/

router.get("/:id", async (req, res) => {
  const where = {};

  if (req.query.read) {
    where.read = req.query.read === "true";
  }

  const user = await User.findByPk(req.params.id, {
    attributes: {
      exclude: ["passwordHash", "createdAt", "updatedAt"],
    },
    include: [
      {
        model: Blog,
        as: "readings",
        attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
        through: {
          as: "reading list",
          attributes: ["id", "read"],
          where,
        },
      },
    ],
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

router.post("/", async (req, res) => {
  const { name, username, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({ name, username, passwordHash });
  res.json(user);
});

router.put("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.username = req.body.username;
    await user.save();
    res.json(user);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
