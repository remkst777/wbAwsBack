"use strict";
const AWS = require("aws-sdk");
const { scan } = require("./dynamodb");
const { CONTINUE_TRACKING_REGION, ACAO } = require("./constants");

AWS.config.update({ region: CONTINUE_TRACKING_REGION });

exports.handler = async () => {
  try {
    await scan();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify({
        errorMessage: err.message
      })
    };
  }
};
