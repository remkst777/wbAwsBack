const AWS = require("aws-sdk");
const { getCurrentPrice, getId } = require("./utils");
const { sendEmail } = require("./emailservice");
const { DYNAMODB_REGION, STORE_PERIOD } = require("./constants");

const Tables = {
  Products: "Products"
};

const documentClient = new AWS.DynamoDB.DocumentClient({
  region: DYNAMODB_REGION
});

async function putItem(item) {
  const params = {
    TableName: Tables.Products,
    Item: item
  };

  await documentClient.put(params).promise();
}

async function getItem(id) {
  const params = {
    TableName: Tables.Products,
    Key: {
      id
    }
  };

  return await documentClient.get(params).promise();
}

async function deleteItem(id) {
  const params = {
    TableName: Tables.Products,
    Key: {
      id
    }
  };

  return await documentClient.delete(params).promise();
}

async function updateHistory(id, history) {
  const params = {
    TableName: Tables.Products,
    Key: {
      id
    },
    UpdateExpression: "set #history = :h",
    ExpressionAttributeValues: {
      ":h": history
    },
    ExpressionAttributeNames: {
      "#history": "history"
    },
    ReturnValues: "ALL_NEW"
  };

  await documentClient.update(params).promise();
}

async function updateIsExceeded(id, isExceeded) {
  const params = {
    TableName: Tables.Products,
    Key: {
      id
    },
    UpdateExpression: "set #isExceeded = :e",
    ExpressionAttributeValues: {
      ":e": isExceeded
    },
    ExpressionAttributeNames: {
      "#isExceeded": "isExceeded"
    },
    ReturnValues: "ALL_NEW"
  };

  await documentClient.update(params).promise();
}

async function updateUsers(id, users) {
  const params = {
    TableName: Tables.Products,
    Key: {
      id
    },
    UpdateExpression: "set #users = :u, #startTracking = :s, #isExceeded = :e",
    ExpressionAttributeValues: {
      ":u": users,
      ":e": false,
      ":s": Date.now()
    },
    ExpressionAttributeNames: {
      "#users": "users",
      "#isExceeded": "isExceeded",
      "#startTracking": "startTracking"
    },
    ReturnValues: "ALL_NEW"
  };

  await documentClient.update(params).promise();
}

async function handleObsoleteData() {
  const params = {
    TableName: Tables.Products
  };

  const { Items } = await documentClient.scan(params).promise();

  // Store period in ms ~ @STORE_PERIOD * 24 * 3600 * 1000
  const storePeriod = STORE_PERIOD * 24 * 3600 * 1000;
  const limit = Date.now() - storePeriod;

  await Promise.all(
    Items.map(async x => {
      const freshHistory = x.history.filter(y => y.date > limit);

      if (x.isExceeded || !x.users.length) {
        return await deleteItem(x.id);
      } else if (limit > x.startTracking) {
        await updateIsExceeded(x.id, true);
      }

      if (freshHistory.length < x.history.length) {
        await updateHistory(x.id, freshHistory);
      }
    })
  );
}

async function scan() {
  const params = {
    TableName: Tables.Products
  };

  const { Items } = await documentClient.scan(params).promise();

  const userMessagesMap = {};

  await Promise.all(
    Items.map(async x => {
      try {
        if (!x.isExceeded) {
          const previousPrice = Number(x.history[x.history.length - 1].price);
          const currentPrice = Number(
            await getCurrentPrice(x.shop, x.articul, x.locale)
          );

          if (currentPrice < previousPrice) {
            x.users.forEach(user => {
              const productInfo = {
                articul: x.articul,
                shop: x.shop,
                title: x.title,
                percentLower: Math.round(
                  (1 - currentPrice / previousPrice) * 100
                ),
                currentPrice
              };

              if (!userMessagesMap[user]) {
                userMessagesMap[user] = [productInfo];
              } else {
                userMessagesMap[user].push(productInfo);
              }
            });
          }

          await updateHistory(x.id, [
            ...x.history,
            { price: currentPrice, date: Date.now() }
          ]);
        }
      } catch (err) {
        console.log(err);
      }
    })
  );

  await Promise.all(
    Object.keys(userMessagesMap).map(async email => {
      const productInfo = userMessagesMap[email];
      const message = JSON.stringify(productInfo);

      await sendEmail(email, message);
    })
  );
}

async function getTrackedItems(user) {
  const params = {
    TableName: Tables.Products,
    FilterExpression: "contains (#users, :user)",
    ExpressionAttributeValues: {
      ":user": user
    },
    ExpressionAttributeNames: {
      "#users": "users"
    }
  };

  return await documentClient.scan(params).promise();
}

async function finishTracking(id, email) {
  const { Item } = await getItem(id);

  const users = new Set(Item.users);
  users.delete(email);

  await updateUsers(id, [...users]);
}

exports.putItem = putItem;
exports.updateUsers = updateUsers;
exports.updateHistory = updateHistory;
exports.scan = scan;
exports.getTrackedItems = getTrackedItems;
exports.getItem = getItem;
exports.finishTracking = finishTracking;
exports.handleObsoleteData = handleObsoleteData;
