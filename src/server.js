const Hapi = require("@hapi/hapi");
const sequelize = require("./config/database");
const Jwt = require("hapi-auth-jwt2");
const User = require("./models/user");
const dotenv = require("dotenv");
const { loadModels } = require("./services/loadModel");
const InputError = require('./exceptions/InputError');

dotenv.config();

const validate = async (decoded, request, h) => {
  try {
    const user = await User.findOne({ where: { email: decoded.email } });
    if (user) {
      return { isValid: true };
    } else {
      return { isValid: false };
    }
  } catch (err) {
    console.error("JWT validation error:", err);
    return { isValid: false };
  }
};

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: "0.0.0.0",
  });

  await server.register(Jwt);

  server.auth.strategy("jwt", "jwt", {
    key: process.env.JWT_SECRET,
    validate,
    verifyOptions: { algorithms: ["HS256"] },
  });

  server.auth.default("jwt");

  server.route(require("./routes/signup"));
  server.route(require("./routes/login"));
  server.route(require("./routes/update_profile"));
  server.route(require("./routes/logout"));
  server.route(require("./routes/reset_password"));
  server.route(require("./routes/user_info"));
  server.route(require("./routes/predict_emotion"));
  server.route(require("./routes/predict_autism"));
  server.route(require("./routes/history_autism"));
  server.route(require("./routes/history_emotion"));

  await sequelize.sync();

  server.ext('onPreResponse', function (request, h) {
    const response = request.response;

    if (response instanceof InputError) {
        const newResponse = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        })
        newResponse.code(response.statusCode)
        return newResponse;
    }

    if (response.isBoom) {
        const newResponse = h.response({
            status: 'fail',
            message: response.message
        })
        newResponse.code(response.output.statusCode)
        return newResponse;
    }

    return h.continue;
  });
  
  const models = await loadModels();
  server.app.models = models;

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
