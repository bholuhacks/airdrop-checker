const fs = require("fs");
const axios = require("axios");

const batchSize = 10;

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function getAirdropStatus(address) {
  const apiUrl = `https://geteligibleuserrequest-xqbg2swtrq-uc.a.run.app/?address=${address.toLowerCase()}`;
  try {
    const response = await axios.get(apiUrl);
    const { amount } = response.data;
    console.log(`${address} has a claim: ${amount} DYM`);
  } catch (error) {
    if (error?.response?.data?.error !== "Address or claimAddress not found") {
      console.error(`Error for ${address}: ${JSON.stringify(error.response)}`);
    }
  }
}

async function getAirdropStatusBatch(batchAddresses) {
  const promises = batchAddresses.map(async (address) => {
    await getAirdropStatus(address);
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
