const Axios = require("axios");

function getValueFromHTML(html, property) {
  return html
    .replace(/(\r\n|\n|\r)/gm, "")
    .match(/<meta(.*?)>/gm)
    .find(x => x.includes([`${property}`]))
    .match(/"(.*?)\"/gim)
    .map(x => x.replace(property, ""))
    .map(x => x.replace(/"/gim, ""))
    .find(x => x);
}

async function getWBPrice(locale, articul) {
  try {
    const { data } = await Axios({
      method: "post",
      headers: { "x-requested-with": "XMLHttpRequest" },
      url: `https://www.wildberries.${locale}/content/cardpromo?cod1s=${articul}`
    });

    return data.Value.promoInfo.PriceWithCouponAndDiscount;
  } catch (err) {
    throw {
      code: "OutOfStock",
      message: "The product is out of stock"
    };
  }
}

async function getWBInfo(locale, articul) {
  let data;

  try {
    const response = await Axios({
      method: "get",
      url: `https://www.wildberries.${locale}/catalog/${articul}/detail.aspx`
    });

    data = response.data;
  } catch (err) {
    throw {
      code: "GetProductInfo",
      message: "Getting product info error"
    };
  }

  const price = await getWBPrice(locale, articul);

  const title = getValueFromHTML(data, "og:title");
  const image = getValueFromHTML(data, "og:image");

  return {
    price,
    title,
    image
  };
}

exports.getWBInfo = getWBInfo;
exports.getWBPrice = getWBPrice;
