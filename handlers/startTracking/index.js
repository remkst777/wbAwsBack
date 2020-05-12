"use strict";
const AWS = require("aws-sdk");
const { getInitialProductData, getId } = require("./utils");
const { putItem, getItem, updateUsers } = require("./dynamodb");
const { START_TRACKING_REGION, ACAO } = require("./constants");

AWS.config.update({ region: START_TRACKING_REGION });

exports.handler = async event => {
  try {
    const { locale, articul, shop } = JSON.parse(event.body);
    const { email } = event.requestContext.authorizer.claims;

    const { title, image, price } = await getInitialProductData(
      shop,
      articul,
      locale
    );

    const id = getId(articul, shop, locale);

    // If all fields are written - put item to DB
    if ((title, image, price)) {
      const { Item } = await getItem(id);

      if (!Item) {
        await putItem({
          id,
          title,
          image,
          isExceeded: false,
          startTracking: Date.now(),
          history: [{ price, date: Date.now() }],
          locale,
          articul,
          shop,
          users: [email]
        });
      }

      if (Item) {
        const uniqueUsers = new Set(Item.users).add(email);
        await updateUsers(id, [...uniqueUsers]);
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ACAO
      },
      body: JSON.stringify({
        id,
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
