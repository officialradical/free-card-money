function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, data) {
  cors(res);
  res.status(status).json(data);
}

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
      externalref
    } = req.body || {};

    if (!externalref) {
      return json(res, 400, {
        status: 0,
        message: "Payment reference is required."
      });
    }

    const response = await fetch(
      "https://api.moolre.com/open/transact/status",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "X-API-USER": process.env.MOOLRE_USER,
          "X-API-PUBKEY": process.env.MOOLRE_PUBLIC_KEY
        },

        body: JSON.stringify({
          type: 1,
          idtype: 1,
          id: externalref,
          accountnumber:
            process.env.MOOLRE_ACCOUNT_NUMBER
        })
      }
    );

    const data = await response.json();

    console.log(
      "Moolre status response:",
      data
    );

    const txstatus =
      data &&
      data.data &&
      data.data.txstatus;

    return json(res, response.status, {

      status:
        data.status,

      message:
        data.message || "",

      txstatus:
        txstatus,

      data:
        data.data || null

    });

  } catch (error) {

    console.error(
      "Moolre status error:",
      error
    );

    return json(res, 500, {
      status: 0,
      message: "Unable to check payment status."
    });

  }

};
