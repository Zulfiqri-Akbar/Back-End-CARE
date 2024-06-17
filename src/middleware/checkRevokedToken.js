const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// In memory store for revoked tokens
const revokedTokens = new Set();

const checkRevokedToken = (request, h) => {
  const authorization = request.headers.authorization;

  if (!authorization) {
    console.error("Authorization header missing");
    throw Boom.unauthorized("Authorization header missing");
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);

    if (revokedTokens.has(decodedToken.jti)) {
      console.error("Token has been revoked", { jti: decodedToken.jti });
      throw Boom.unauthorized("Token has been revoked");
    }

    return h.continue;
  } catch (err) {
    console.error("Error checking token:", err);
    throw Boom.unauthorized("Invalid or expired token");
  }
};

module.exports = {
  checkRevokedToken,
  revokedTokens,
};
