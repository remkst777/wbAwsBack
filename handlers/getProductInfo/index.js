"use strict";
const AWS = require("aws-sdk");
const { getInitialProductData, getId } = require("./utils");
const { GET_PRODUCT_INFO_REGION, ACAO } = require("./constants");

AWS.config.update({ region: GET_PRODUCT_INFO_REGION });

exports.handler = async event => {
  try {
    const { locale, articul, shop } = JSON.parse(event.body);
    const { price, title, image } = await getInitialProductData(
      shop,
      articul,
      locale
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify({
        id: getId(articul, shop, locale),
        title,
        image,
        locale,
        articul,
        shop,
        price,
      })
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
