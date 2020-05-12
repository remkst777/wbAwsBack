"use strict";
const AWS = require("aws-sdk");
const { getItem } = require("./dynamodb");
const { GET_STAT_FOR_DAY_REGION, ACAO } = require("./constants");

AWS.config.update({ region: GET_STAT_FOR_DAY_REGION });

exports.handler = async event => {
  try {
    const { id } = JSON.parse(event.body);

    const { Item } = await getItem(id);

    delete Item.users;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify(Item)
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
