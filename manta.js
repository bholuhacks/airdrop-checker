const fs = require("fs");
const axios = require("axios");

const apiUrl = "https://np-api.newparadigm.manta.network/getPointsV1";
const batchSize = 10;

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function getAirdropStatusBatch(batchAddresses) {
  const promises = batchAddresses.map(async (address) => {
    try {
      const response = await axios.post(apiUrl, {
        address: address,
      });

      const { data } = response.data;

      if (Number(data?.total_score || 0) !== 0) {
        console.log(`${address} has a claim: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error(`Error for ${address}: ${JSON.stringify(error.response)}`);
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
