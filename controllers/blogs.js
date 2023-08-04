const router = require("express").Router();
const { Op } = require("sequelize");

const { SECRET } = require("../utils/config");

const { Blog } = require("../models");
const User = require("../models/user.js");

const jwt = require("jsonwebtoken");

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

router.get("/", async (req, res) => {
  let where = {};

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: `${req.query.search}%`,
          },
        },
        {
          author: {
            [Op.iLike]: `${req.query.search}%`,
          },
        },
      ],
    };
  }
  const blogs = await Blog.findAll({
    attributes: {
      exclude: ["userId", "createdAt", "updatedAt"],
    },
    include: {
      model: User,
      attributes: ["name"],
    },
    where,
    order: [["likes", "DESC"]],
  });
  res.json(blogs);
});

router.post("/", tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id);
  const blog = await Blog.create({
    ...req.body,
    userId: user.id,
    date: new Date(),
  });
  res.json(blog);
});

router.delete("/:id", blogFinder, tokenExtractor, async (req, res) => {
  if (!req.blog) {
    res.status(404).json({ message: "Blog not found" });
  }

  if (req.blog.userId === req.decodedToken.id) {
    await req.blog.destroy();
    res.status(200).json({ message: "Deleted blog successfully" });
  } else {
    res.status(401).json({ message: "Unauthorized operation" });
  }
});

router.put("/:id", blogFinder, async (req, res) => {
  if (req.blog) {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
