const getHistoriesEmotion = require("../services/getHistories_emotion");
const { checkRevokedToken } = require("../middleware/checkRevokedToken");

module.exports = {
    method: 'GET',
    path: '/predict_emotion/histories',
    options: {
        auth: "jwt",
        pre: [{method: checkRevokedToken}],
    },
    handler: async (request, h) => {
        histories = await getHistoriesEmotion()
        const response = h.response({
            status: 'success',
            data: histories
        })
        return response;
    }
}