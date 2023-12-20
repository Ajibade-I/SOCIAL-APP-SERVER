function succesResponse(res, message, data = null) {
  const response = {
    success: true,
    message,
  };
  if (message.length === 0) {
    response.message = undefined;
  }
  if (data !== null) {
    response.data = data;
  }

  return res.status(200).json(response);
}

function pagenation(page, data) {
  const startingIndex = (page - 1) * 10;
  const lastIndex = startingIndex + 10;
  const dataByPage = data.slice(startingIndex, lastIndex);

  return dataByPage;
}

module.exports.succesResponse = succesResponse;
module.exports.pagenation = pagenation;
