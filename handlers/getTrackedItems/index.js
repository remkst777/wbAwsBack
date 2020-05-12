"use strict";
const AWS = require("aws-sdk");
const { getTrackedItems } = require("./dynamodb");
const { GET_TRACKED_REGION, ACAO } = require("./constants");

AWS.config.update({ region: GET_TRACKED_REGION });

exports.handler = async event => {
  try {
    const { email } = event.requestContext.authorizer.claims;
    const { Items } = await getTrackedItems(email);
    
    Items.forEach(x => { delete x.history; delete x.users });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify(Items),
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
