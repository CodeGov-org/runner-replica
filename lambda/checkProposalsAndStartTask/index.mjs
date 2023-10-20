import https from "https";

export const handler = async (event) => {
  const proposals = await get_open_replica_proposals();
  if (proposals.data.length == 0) {
    console.log("Success: No Open Proposals Found");
    return { statusCode: 200, body: "No open proposals found" };
  }

  // parse to get proposal ids
  // update store prop
  // execute task (if open)

  return { statusCode: 200, body: JSON.stringify(proposals) };
};

handler();

async function get_open_replica_proposals() {
  const url =
    "https://ic-api.internetcomputer.org/api/v3/proposals?include_topic=TOPIC_REPLICA_VERSION_MANAGEMENT&include_status=OPEN";

  return new Promise((resolve) => {
    https
      .get(url, (resp) => {
        let data = "";

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Handle the result.
        resp.on("end", () => {
          const result = JSON.parse(data);
          // if success
          if ("data" in result) {
            resolve(result);
          } else {
            console.log("Error, API Proposals Failed Response: " + data);
            process.exit(1);
          }
        });
      })
      .on("error", (err) => {
        console.log("Error on API Proposals: " + err.message);
        process.exit(1);
      });
  });
}
