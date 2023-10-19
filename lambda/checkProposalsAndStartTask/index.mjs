import https from "https";

export const handler = async (event) => {
  const proposals = await get_proposals();

  return { statusCode: 200, body: JSON.stringify(proposals) };
};

async function get_proposals() {
  const url = "https://ic-api.internetcomputer.org/api/v3/proposals?limit=100";

  return new Promise((resolve) => {
    https
      .get(url, (resp) => {
        let data = "";

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
        resolve(false);
      });
  });
}
