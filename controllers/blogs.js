const router = require("express").Router();

const { Blog } = require("../models");

const blogFinder = async (req, res, next) => {
  req.note = await Blog.findByPk(req.params.id);
  next();
};

router.get("/", async (req, res) => {
  const blogs = await Blog.findAll();
  res.json(blogs);
});

router.post("/", async (req, res) => {
  const blog = await Blog.create(req.body);
  res.json(blog);
});

router.delete("/:id", blogFinder, async (req, res) => {
  try {
    if (req.blog) {
      await req.blog.destroy();
      res.status(200).json({ message: "Deleted blog successfully" });
    } else {
      res.status(400).json({ message: "Blog not found" });
    }
  } catch (e) {
    res.status(400).json({ e });
  }
});

router.put("/:id", blogFinder, async (req, res) => {
  if (req.note) {
    req.note.likes = req.body.likes;
    await req.note.save();
    res.json(req.note);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
