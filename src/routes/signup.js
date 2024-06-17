const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");
const User = require("../models/user");

module.exports = {
  method: "POST",
  path: "/signup",
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        username: Joi.string().required().messages({
          "any.required": "Username is required",
          "string.empty": "Username cannot be empty",
        }),
        email: Joi.string().email().required().messages({
          "any.required": "Email is required",
          "string.email": "Email must be a valid email address",
          "string.empty": "Email cannot be empty",
        }),
        password: Joi.string().min(6).required().messages({
          "any.required": "Password is required",
          "string.min": "Password must be at least 6 characters long",
          "string.empty": "Password cannot be empty",
        }),
        confirm_password: Joi.string()
          .required()
          .valid(Joi.ref("password"))
          .messages({
            "any.required": "Confirm password is required",
            "any.only": "Password and confirm password must match",
            "string.empty": "Confirm password cannot be empty",
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
      multipart: true, // Enable multipart form data parsing
      output: "data", // Parse payload as a data object
      parse: true, // Automatically parse incoming payloads
    },
  },
  handler: async (request, h) => {
    const { username, email, password } = request.payload;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      return h.response({ message: "User created successfully" }).code(201);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        throw Boom.badRequest("Email already exists");
      }
      throw Boom.internal("An error occurred while processing your request");
    }
  },
};
