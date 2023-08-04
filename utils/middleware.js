const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "SequelizeValidationError") {
    if (
      error.errors[0].validatorName &&
      error.errors[0].validatorName.includes("isEmail")
    ) {
      return res
        .status(400)
        .send({ error: "Validation isEmail on username failed" });
    } else if (
      error.errors[0].validatorName &&
      error.errors[0].validatorName.includes("min")
    ) {
      return res
        .status(400)
        .send({ error: "Please provide a year later than or equal to 1991" });
    } else if (
      error.errors[0].validatorName &&
      error.errors[0].validatorName.includes("max")
    ) {
      return res
        .status(400)
        .send({ error: "Year cannot be greater than the current year." });
    }
  } else if ((error.name = "SequelizeDatabaseError")) {
    return res.status(400).send({ error: "Missing data" });
  }

  next(error);
};

module.exports = { errorHandler };
