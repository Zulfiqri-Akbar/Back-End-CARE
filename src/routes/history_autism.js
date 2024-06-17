const getHistoriesAutism = require("../services/getHistories_autism");
const { checkRevokedToken } = require("../middleware/checkRevokedToken");

module.exports = {
    method: 'GET',
    path: '/predict_autism/histories',
    options: {
        auth: "jwt",
        pre: [{method: checkRevokedToken}],
    },
    handler: async (request, h) => {
        histories = await getHistoriesAutism()
        const response = h.response({
            status: 'success',
            data: histories
        })
        return response;
    }
}