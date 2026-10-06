function json(res, status, data) {
  res.status(status).json(data);
}

module.exports = async function handler(req, res) {

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

    return json(
      res,
      response.status,
      data
    );

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
