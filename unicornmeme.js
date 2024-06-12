const fs = require("fs");

const batchSize = 10;

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function getAirdropStatusBatch(batchAddresses) {
  const promises = batchAddresses.map(async (address) => {
    try {
      const response = await fetch(
        `https://crossdrop.unicorn.meme/claim_record/${address}`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            pragma: "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            Referer: "https://unicorn.meme/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
          body: null,
          method: "GET",
        }
      );
      const data = await response.json();
      const availableToClaim =
        data?.available_to_claim?.length > 0 ? data?.available_to_claim : null;
      const claimedAndPending =
        data?.claimed_and_pending?.length > 0
          ? data?.claimed_and_pending
          : null;
      const sent = data?.sent?.length > 0 ? data?.sent : null;
      if (availableToClaim || claimedAndPending || sent) {
        console.info(address, data);
      }
    } catch (error) {
      // console.error("error", error);
      // console.error(`Error for ${address}: ${JSON.stringify(error.response)}`);
    }
  });

  await Promise.all(promises);
}

async function processFile(fileName) {
  const fileContent = fs.readFileSync(fileName, "utf-8");
  const addresses = fileContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const chunk of chunks(addresses, batchSize)) {
    await getAirdropStatusBatch(chunk);
  }
}

const fileName = "wallets.txt";

processFile(fileName)
  .then(() => {})
  .catch((error) => console.error("Error:", error));
