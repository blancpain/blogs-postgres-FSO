const jwt = require("jsonwebtoken");
const { SECRET } = require("./config");
const { User, Session } = require("../models");

const errorHandler = (error, req, res, next) => {
  console.log(error.message);
  console.log(error);

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
  } else if (
    (error.name =
      "SequelizeUniqueConstraintError" &&
      typeof error.parent.table !== "undefined" &&
      error.parent.table === "sessions")
  ) {
    return res.status(400).send({ error: "You are already logged in!" });
  } else if ((error.name = "SequelizeDatabaseError")) {
    return res.status(400).send({ error: "Missing data" });
  }

  next(error);
};

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    try {
      req.token = authorization.replace("bearer ", "");
      // req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  } else {
    req.user = await User.findByPk(decodedToken.id);
    if (req.user.disabled) {
      req.user = null;
      return res
        .status(401)
        .json({ error: "User is disabled. Please contact admin" });
    }
  }

  next();
};

const sessionExtractor = async (req, res, next) => {
  const activeSession = await Session.findOne({
    where: {
      userId: req.user.id,
    },
  });

  if (!activeSession) {
    return res
      .status(401)
      .json({ error: "No active sessions found. Please log in again." });
  } else {
    req.session = activeSession;
  }

  next();
};

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor,
  sessionExtractor,
};
