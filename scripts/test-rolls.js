import { ethers } from "ethers";
import { readFileSync } from "fs";

async function testMultipleRolls() {
  console.log("Testing multiple gacha rolls...\n");

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractJson = JSON.parse(
    readFileSync("./artifacts/contracts/GachaGame.sol/GachaGame.json", "utf8")
  );

  const gachaGame = new ethers.Contract(
    contractAddress,
    contractJson.abi,
    signer
  );

  const rollPrice = await gachaGame.rollPrice();

  console.log("🎲 Rolling 10 characters...\n");

  const rarityCount = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };

  for (let i = 0; i < 10; i++) {
    const tx = await gachaGame.roll({ value: rollPrice });
    await tx.wait();

    const totalChars = await gachaGame.getTotalCharacters();
    const character = await gachaGame.getCharacter(totalChars);
    const rarityName = await gachaGame.getRarityName(character.rarity);

    rarityCount[rarityName]++;

    console.log(`Roll ${i + 1}: ${character.name} - ${rarityName} (Power: ${character.power})`);
  }

  console.log("\n📊 Rarity Distribution:");
  console.log(`  COMMON: ${rarityCount.COMMON} (Expected: ~74%)`);
  console.log(`  RARE: ${rarityCount.RARE} (Expected: ~20%)`);
  console.log(`  EPIC: ${rarityCount.EPIC} (Expected: ~5%)`);
  console.log(`  LEGENDARY: ${rarityCount.LEGENDARY} (Expected: ~1%)`);

  console.log("\n✅ Frontend should now show 11 total characters!");
}

testMultipleRolls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
