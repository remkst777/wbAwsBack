const AWS = require("aws-sdk");
const { EMAIL_SENDER } = require("./constants");

const ses = new AWS.SES();

async function sendEmail(emailReceiver, message) {
  const params = {
    Destination: {
      ToAddresses: [emailReceiver]
    },
    Source: EMAIL_SENDER,
    Message: {
      Subject: {
        Data: "Снижена стоимость некоторых отслеживаемых Вами товаров!",
        Charset: "UTF-8"
      },
      Body: {
        Text: {
          Data: message,
          Charset: "UTF-8"
        }
      },
    }
  };

  await ses.sendEmail(params).promise();
}

exports.sendEmail = sendEmail;
