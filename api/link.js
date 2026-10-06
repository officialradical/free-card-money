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
    const { product, externalref, email } = req.body || {};

    if (!product || !PRODUCTS[product]) {
      return json(res, 400, {
        status: 0,
        message: "Invalid product."
      });
    }

    if (!externalref) {
      return json(res, 400, {
        status: 0,
        message: "Payment reference is required."
      });
    }

    const response = await fetch(
      "https://api.moolre.com/embed/link",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-API-USER": (process.env.MOOLRE_USER || "").trim(),
          "X-API-PUBKEY": (process.env.MOOLRE_PUBLIC_KEY || "").replace(/\s+/g, "")
        },

        body: JSON.stringify({
          type: 1,
          amount: String(PRODUCTS[product]),
          email: email || "payments@freecard.store",
          externalref: externalref,
          reusable: "0",
          currency: "GHS",
          accountnumber: (process.env.MOOLRE_ACCOUNT_NUMBER || "").trim(),
          redirect: "https://freecard.store/"
        })
      }
    );

    const data = await response.json();

    console.log("Moolre link response:", data);

    return json(res, response.status, data);

  } catch (error) {

    console.error("Moolre link error:", error);

    return json(res, 500, {
      status: 0,
      message: "Payment link service error."
    });
  }
}; 
