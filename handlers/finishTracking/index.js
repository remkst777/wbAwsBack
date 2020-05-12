"use strict";
const AWS = require("aws-sdk");
const { finishTracking } = require("./dynamodb");
const { FINISH_TRACKING_REGION, ACAO } = require("./constants");

AWS.config.update({ region: FINISH_TRACKING_REGION });

exports.handler = async event => {
  try {
    const { email } = event.requestContext.authorizer.claims;
    const { id } = JSON.parse(event.body);

    await finishTracking(id, email);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify({}),
    };
  } catch ({ message, code }) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify({
        errorMessage: message,
        code,
      })
    };
  }
};
