const router = require("express").Router();
const { Op } = require("sequelize");
const { Blog, User } = require("../models");
const {
  tokenExtractor,
  userExtractor,
  sessionExtractor,
} = require("../utils/middleware");

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
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

router.post(
  "/",
  tokenExtractor,
  userExtractor,
  sessionExtractor,
  async (req, res) => {
    const blog = await Blog.create({
      ...req.body,
      userId: req.user.id,
      date: new Date(),
    });
    res.json(blog);
  }
);

router.delete(
  "/:id",
  blogFinder,
  tokenExtractor,
  userExtractor,
  async (req, res) => {
    if (!req.blog) {
      res.status(404).json({ message: "Blog not found" });
    }

    if (req.blog.userId === req.user.id) {
      await req.blog.destroy();
      res.status(200).json({ message: "Deleted blog successfully" });
    } else {
      res.status(401).json({ message: "Unauthorized operation" });
    }
  }
);

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
