const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "SequelizeValidationError") {
    return res.status(400).send({ error: "Missing data" });
  } else if ((error.name = "SequelizeDatabaseError")) {
    return res.status(400).send({ error: "Incorrect data provided" });
  }

  next(error);
};

module.exports = { errorHandler };
