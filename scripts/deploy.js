import { ethers } from "ethers";
import fs from "fs";
import { readFileSync } from "fs";

async function main() {
  console.log("Deploying GachaGame contract...");

  // Connect to local network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  console.log("Deploying from account:", await signer.getAddress());

  // Read compiled contract
  const contractJson = JSON.parse(
    readFileSync("./artifacts/contracts/GachaGame.sol/GachaGame.json", "utf8")
  );

  // Create contract factory
  const GachaGame = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    signer
  );

  // Deploy the contract
  const gachaGame = await GachaGame.deploy();

  await gachaGame.waitForDeployment();

  const address = await gachaGame.getAddress();

  console.log("GachaGame deployed to:", address);
  console.log("Roll price:", ethers.formatEther(await gachaGame.rollPrice()), "ETH");

  // Save the contract address to a file for the frontend
  const contractsDir = "./frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ GachaGame: address }, undefined, 2)
  );

  // Copy the contract ABI
  fs.writeFileSync(
    contractsDir + "/GachaGame.json",
    JSON.stringify(contractJson, null, 2)
  );

  console.log("Contract artifacts saved to frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
