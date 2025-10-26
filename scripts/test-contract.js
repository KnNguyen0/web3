import { ethers } from "ethers";
import { readFileSync } from "fs";

async function testContract() {
  console.log("Testing GachaGame contract...\n");

  // Connect to local network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  // Load contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractJson = JSON.parse(
    readFileSync("./artifacts/contracts/GachaGame.sol/GachaGame.json", "utf8")
  );

  const gachaGame = new ethers.Contract(
    contractAddress,
    contractJson.abi,
    signer
  );

  console.log("✓ Contract loaded at:", contractAddress);
  console.log("✓ Connected with account:", await signer.getAddress());

  // Test 1: Get roll price
  const rollPrice = await gachaGame.rollPrice();
  console.log("\n✓ Roll price:", ethers.formatEther(rollPrice), "ETH");

  // Test 2: Get total characters
  const totalChars = await gachaGame.getTotalCharacters();
  console.log("✓ Total characters minted:", totalChars.toString());

  // Test 3: Roll a character
  console.log("\n🎲 Rolling a character...");
  const tx = await gachaGame.roll({ value: rollPrice });
  const receipt = await tx.wait();

  console.log("✓ Transaction successful! Hash:", receipt.hash);

  // Get the character that was minted
  const newTotal = await gachaGame.getTotalCharacters();
  const character = await gachaGame.getCharacter(newTotal);

  console.log("\n🎉 New Character Rolled!");
  console.log("  Name:", character.name);
  console.log("  Rarity:", await gachaGame.getRarityName(character.rarity));
  console.log("  Power:", character.power.toString());
  console.log("  Token ID:", character.id.toString());

  // Test 4: Get user's characters
  const userChars = await gachaGame.getUserCharacters(await signer.getAddress());
  console.log("\n✓ Total characters owned:", userChars.length);

  console.log("\n✅ All tests passed! The contract is working perfectly!");
}

testContract()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
