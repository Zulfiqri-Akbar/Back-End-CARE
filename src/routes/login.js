const jwt = require("jsonwebtoken");
const Boom = require("@hapi/boom");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");

const ACCESS_TOKEN_EXPIRE_DAYS = 1;

module.exports = {
  method: "POST",
  path: "/login",
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required().messages({
          "any.required": "Email is required",
          "string.email": "Email must be a valid email address",
          "string.empty": "Email cannot be empty",
        }),
        password: Joi.string().required().messages({
          "any.required": "Password is required",
          "string.empty": "Password cannot be empty",
        }),
      }),
      options: {
        allowUnknown: false,
      },
      failAction: async (request, h, err) => {
        const errorDetails = err.details.map((detail) => detail.message);
        throw Boom.badRequest(`${errorDetails.join(", ")}`);
      },
    },
    payload: {
      multipart: true,
      output: "data",
      parse: true,
    },
  },
  handler: async (request, h) => {
    const { email, password } = request.payload;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw Boom.unauthorized("Invalid email or password");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw Boom.unauthorized("Invalid email or password");
      }

      const jti = uuidv4(); // Generate a unique jti

      const token = jwt.sign(
        { email: user.email, jti }, 
        process.env.JWT_SECRET, 
        { expiresIn: `${ACCESS_TOKEN_EXPIRE_DAYS}d` }
      );

      return h.response({ access_token: token, token_type: "Bearer" });
    } catch (err) {
      console.error("Login error:", err);
      if (Boom.isBoom(err)) {
        throw err;
      } else {
        throw Boom.internal("An error occurred while processing your request");
      }
    }
  },
};
