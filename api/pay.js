function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, data) {
  cors(res);
  res.status(status).json(data);
}

const PRODUCTS = {
  "Digital Card — Basic": 100,
  "Digital Card — Plus": 200,
  "Digital Card — Premium": 300
};

const CHANNELS = {
  MTN: "13",
  Telecel: "6",
  AirtelTigo: "7"
};

module.exports = async function handler(req, res) {

  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return json(res, 405, {
      status: 0,
      message: "Method not allowed"
    });
  }

  try {

    const {
      product,
      phone,
      network,
      externalref,
      otpcode
    } = req.body || {};

    if (!product || !PRODUCTS[product]) {
      return json(res, 400, {
        status: 0,
        message: "Invalid product."
      });
    }

    if (!phone || !/^0\d{9}$/.test(phone)) {
      return json(res, 400, {
        status: 0,
        message: "Invalid Ghana phone number."
      });
    }

    if (!network || !CHANNELS[network]) {
      return json(res, 400, {
        status: 0,
        message: "Invalid Mobile Money network."
      });
    }

    if (!externalref) {
      return json(res, 400, {
        status: 0,
        message: "Payment reference is required."
      });
    }

    const body = {
      type: 1,
      channel: CHANNELS[network],
      currency: "GHS",
      payer: phone,
      amount: String(PRODUCTS[product]),
      externalref: externalref,
      accountnumber: process.env.MOOLRE_ACCOUNT_NUMBER
    };

    if (otpcode) {
      body.otpcode = otpcode;
    }

    const response = await fetch(
      "https://api.moolre.com/open/transact/payment",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-API-USER": process.env.MOOLRE_USER,
          "X-API-PUBKEY": process.env.MOOLRE_PUBLIC_KEY
        },

        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    return json(res, response.status, data);

  } catch (error) {

    console.error("Moolre payment error:", error);

    return json(res, 500, {
      status: 0,
      message: "Payment service error."
    });

  }

};
