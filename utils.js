const { getLamodaInfo } = require("./lamodaservice");
const { getWBInfo, getWBPrice } = require("./wbservice");

const getId = (articul, shop, locale) => `${articul}${shop}${locale}`;

async function getInitialProductData(shop, articul, locale) {
  let info;

  if (shop === "wildberries") {
    info = await getWBInfo(locale, articul);
  }

  if (shop === "lamoda") {
    info = await getLamodaInfo(locale, articul);
  }

  return info;
}

async function getCurrentPrice(shop, articul, locale) {
  let price;

  if (shop === "wildberries") {
    price = await getWBPrice(locale, articul);
  }

  if (shop === "lamoda") {
    const response = await getLamodaInfo(locale, articul);
    price = response.price;
  }

  return price;
}

exports.getInitialProductData = getInitialProductData;
exports.getCurrentPrice = getCurrentPrice;
exports.getId = getId;
