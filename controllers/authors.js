const router = require("express").Router();
const { Op } = require("sequelize");
const { Blog } = require("../models");

const { sequelize } = require("../utils/db");

router.get("/", async (req, res) => {
  const authors = await Blog.findAll({
    attributes: {
      exclude: [
        "userId",
        "url",
        "id",
        "title",
        "likes",
        "createdAt",
        "updatedAt",
        "year",
      ],
      include: [
        [sequelize.fn("COUNT", sequelize.col("title")), "articles"],
        [sequelize.fn("SUM", sequelize.col("likes")), "likes"],
      ],
    },
    group: "author",
    order: [["likes", "DESC"]],
  });
  res.json(authors);
});

module.exports = router;
