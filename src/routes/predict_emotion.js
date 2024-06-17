const predictClassificationEmotion = require('../services/inferenceService_emotion');
const storeData = require('../services/storeData');
const crypto = require('crypto');
const { checkRevokedToken } = require("../middleware/checkRevokedToken");
const Boom = require('@hapi/boom');

module.exports = {
  method: 'POST',
  path: '/predict_emotion',
  options: {
    auth: "jwt",
    pre: [{ method: checkRevokedToken }],
    payload: {
      allow: 'multipart/form-data',
      multipart: true,
      maxBytes: 1000000,
    },
  },
  handler: async (request, h) => {
    const { image } = request.payload;
    const { models } = request.server.app;
    const model = models.model2;

    try {
      const { label } = await predictClassificationEmotion(model, image);

      const id = crypto.randomUUID();
      const createdAt = new Date();

      const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const formattedDate = createdAt.toLocaleDateString('en-GB', options);
      const formattedDateTime = `${formattedDate}`;

      // Define suggestions based on the predicted label
      const suggestions = {
        'Natural': 'Anak anda terdeteksi dalam kondisi emosi normal.',
        'anger': 'Anak anda terdeteksi dalam kondisi emosi marah.',
        'fear': 'Anak anda terdeteksi dalam kondisi emosi takut.',
        'joy': 'Anak anda terdeteksi dalam kondisi emosi gembira.',
        'sadness': 'Anak anda terdeteksi dalam kondisi emosi sedih.',
        'surprise': 'Anak anda terdeteksi dalam kondisi emosi shock atau terkejut.'
      };

      const suggestion = suggestions[label];

      const data = {
        id: id,
        result: label,
        suggestion: suggestion,
        createdAt: formattedDateTime,
      };

      await storeData(id, data,'emotion');

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
