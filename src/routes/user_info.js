const Boom = require("@hapi/boom");
const User = require("../models/user");
const {checkRevokedToken} = require("../middleware/checkRevokedToken");

module.exports = {
  method: "GET",
  path: "/user/info",
  options: {
    auth: "jwt",
    pre: [{ method: checkRevokedToken }],
  },
  handler: async (request, h) => {
    const { email: currentEmail } = request.auth.credentials;

    try {
      console.log(`Fetching user info for: ${currentEmail}`);

      const user = await User.findOne({ where: { email: currentEmail } });

      if (!user) {
        console.log(`User not found: ${currentEmail}`);
        throw Boom.notFound("User not found");
      }

      // Prepare user information
      const userInfo = {
        profile_picture: user.profile_picture,
        username: user.username,
        email: user.email,
        password: "*********",
      };

      return userInfo;
    } catch (err) {
      console.error("Error fetching user information:", err);
      throw Boom.internal(`An error occurred: ${err.message}`);
    }
  },
};
