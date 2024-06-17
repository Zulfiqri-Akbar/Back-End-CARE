const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const Boom = require("@hapi/boom");
const User = require("../models/user");

module.exports = {
  method: "PUT",
  path: "/reset_password",
  options: {
    auth: false,
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required().messages({
          "any.required": "Email is required",
          "string.email": "Email must be a valid email address",
          "string.empty": "Email cannot be empty",
        }),
        new_password: Joi.string().min(6).required().messages({
          "any.required": "Password is required",
          "string.min": "Password must be at least 6 characters long",
          "string.empty": "Password cannot be empty",
        }),
        confirm_password: Joi.string()
          .required()
          .valid(Joi.ref("new_password"))
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
      multipart: true, 
      output: "data", 
      parse: true, 
    },
  },
  handler: async (request, h) => {
    const { email, new_password } = request.payload;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return Boom.notFound("User not found");
      }

      user.password = await bcrypt.hash(new_password, 10);
      await user.save();

      return h.response({ message: "Password reset successfully" });
    } catch (err) {
      throw Boom.internal(`An error occurred: ${err.message}`);
    }
  },
};
