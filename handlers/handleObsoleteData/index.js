"use strict";
const AWS = require("aws-sdk");
const { handleObsoleteData } = require("./dynamodb");
const { HANDLE_OBSOLETE_DATA, ACAO } = require("./constants");

AWS.config.update({ region: HANDLE_OBSOLETE_DATA });

exports.handler = async () => {
  try {
    await handleObsoleteData();

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
