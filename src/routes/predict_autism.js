const predictClassificationAutism = require('../services/inferenceService_autism');
const storeData = require('../services/storeData');
const crypto = require('crypto');
const { checkRevokedToken } = require("../middleware/checkRevokedToken");
const Boom = require('@hapi/boom');


module.exports = {
  method: 'POST',
  path: '/predict_autism',
  options: {
    auth: "jwt",
    pre: [{method: checkRevokedToken}],
    payload: {
      allow: 'multipart/form-data',
      multipart: true,
      maxBytes: 1000000,
    },
  },
  handler: async (request, h) => {
    const { image } = request.payload;
    const { models } = request.server.app;
    const model = models.model1;

    try {
      const { label } = await predictClassificationAutism(model, image);
      
      const id = crypto.randomUUID();
      const createdAt = new Date();

      const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const formattedDate = createdAt.toLocaleDateString('en-GB', options);
      const formattedDateTime = `${formattedDate}`;

      const suggestion = label === 'autistic'
        ? 'Anak anda berpotensi mengidap autisme, segera konsultasikan ke dokter yaaa.'
        : 'Anak anda tidak teridentifikasi mengidap autisme.';

      const data = {
        id: id,
        result: label,
        suggestion: suggestion,
        createdAt: formattedDateTime,
      };

      await storeData(id, data, 'autism');

      const response = h.response({
        status: 'success',
        message: 'Model is predicted successfully',
        data,
      });
      response.code(201);
      return response;
    } catch (error) {
      console.error('Prediction error:', error);
      throw Boom.badImplementation('Failed to process prediction');
    }
  },
};
