const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");
const { revokedTokens } = require("../middleware/checkRevokedToken");

module.exports = {
  method: "POST",
  path: "/logout",
  options: {
    auth: "jwt",
  },
  handler: async (request, h) => {
    try {
      const authorizationHeader = request.headers.authorization;

      if (!authorizationHeader) {
        console.error("Authorization header is missing");
        throw Boom.unauthorized("Authorization header is missing");
      }

      const token = authorizationHeader.replace("Bearer ", "");

      // Decode the token to get its payload (without verification)
      const decodedToken = jwt.decode(token);

      if (!decodedToken || !decodedToken.jti) {
        console.error("Invalid token structure or missing jti", { token, decodedToken });
        throw Boom.badRequest("Invalid token");
      }

      // Check if the token has already been revoked
      if (revokedTokens.has(decodedToken.jti)) {
        console.error("Token has already been revoked", { jti: decodedToken.jti });
        throw Boom.unauthorized("Token has already been revoked");
      }

      // Add the token's jti to the set of revoked tokens
      revokedTokens.add(decodedToken.jti);

      console.log(`Token with jti ${decodedToken.jti} has been revoked`);

      return h.response({ message: "Logged out successfully" }).code(200);
    } catch (err) {
      console.error("Error during logout:", err);
      if (Boom.isBoom(err)) {
        throw err; // Throw Boom errors directly
      } else {
        throw Boom.internal(
          "An error occurred while processing your logout request"
        );
      }
    }
  },
};
