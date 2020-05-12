const Axios = require("axios");

async function getLamodaInfo(locale, articul) {
  let data;

  try {
    const response = await Axios({
      method: "get",
      url: `https://www.lamoda.${locale}/p/${articul}/`
    });

    data = response.data;
  } catch (err) {
    throw {
      code: "GetProductInfo",
      message: "Getting product info error"
    };
  }

  const price = data
    .replace(/(\r\n|\n|\r)/gm, "")
    .match(/{(.*?)}/gm)
    .filter(x => x.includes("price"))
    .filter(x => x.includes("current"))[0]
    .match(/current(.*?),/gm)[0]
    .match(/[0-9.]+/gim)[0];

  const title = data
    .replace(/(\r\n|\n|\r)/gm, "")
    .match(/<img(.*?)>/gm)
    .filter(x => x.includes("itemprop"))[0]
    .match(/alt="(.*?)"/gm)[0]
    .replace(/alt=/gim, "")
    .replace(/"/gim, "");

  const image = data
    .replace(/(\r\n|\n|\r)/gm, "")
    .match(/<img(.*?)>/gm)
    .filter(x => x.includes("itemprop"))[0]
    .match(/src="(.*?)"/gm)[0]
    .replace(/src=/gim, "")
    .replace(/"/gim, "");

  const isStock = data
    .replace(/(\r\n|\n|\r)/gm, "")
    .match(/data-in-stock="(.*?)"/gm)[0]
    .replace("data-in-stock=", "")
    .replace(/"/gim, "");

  if (!JSON.parse(isStock)) {
    throw {
      code: "OutOfStock",
      message: "The product is out of stock"
    };
  }

  return {
    price: Number(price),
    title,
    image
  };
}

exports.getLamodaInfo = getLamodaInfo;
