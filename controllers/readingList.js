const router = require("express").Router();
const {
  tokenExtractor,
  userExtractor,
  sessionExtractor,
} = require("../utils/middleware");
const { User, Blog, ReadingList } = require("../models");

router.post("/", async (req, res) => {
  const { blogId, userId } = req.body;

  const additionToReadingList = await ReadingList.create({
    blogId,
    userId,
  });

  res.json(additionToReadingList);
});

router.post(
  "/:id",
  tokenExtractor,
  userExtractor,
  sessionExtractor,
  async (req, res) => {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Blog,
          as: "readings",
          attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
          through: {
            as: "reading_list",
            attributes: ["id", "read"],
          },
        },
      ],
    });

    if (!user) {
      res.status(404).end();
    }

    if (
      user.readings.some(
        (reading) => reading.reading_list.id === Number(req.params.id)
      )
    ) {
      await ReadingList.update(
        { read: req.body.read },
        {
          where: {
            id: Number(req.params.id),
          },
        }
      );

      await user.reload();
      res.json(user);
    } else {
      res.status(404).json({ error: "Unauthorized operation" });
    }
  }
);

module.exports = router;
