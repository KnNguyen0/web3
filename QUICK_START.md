# Quick Start Guide - Stellar Gacha RPG

## 🚀 Get Started in 5 Minutes

### Step 1: Test the Smart Contract

```bash
cd soroban-contracts/gacha_game
cargo test
```

**Expected output**: `test result: ok. 3 passed`

---

### Step 2: Start the Frontend

```bash
cd frontend
npm start
```

**Opens**: http://localhost:3000

**Note**: Currently shows legacy Ethereum interface. Stellar integration is ready but needs contract deployment to be fully functional.

---

### Step 3: Install Freighter Wallet

1. Visit: https://www.freighter.app/
2. Add extension to your browser
3. Create new wallet or import existing
4. Switch to **Stellar Testnet**
5. Get testnet XLM: https://laboratory.stellar.org/#account-creator?network=test

---

## 📋 To Complete the Hackathon Submission

Follow the detailed steps in [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)

**Quick overview**:
1. ✅ Smart contract: DONE
2. 🚧 Deploy to testnet: PENDING (SSL issue on Windows)
3. 🚧 Record demo video: PENDING
4. 🚧 Take screenshots: PENDING
5. 🚧 Create Canva presentation: PENDING
6. 🚧 Deploy demo site: PENDING

---

## 🔧 Deploy Contract (When Ready)

```bash
# Fund your account first at:
# https://laboratory.stellar.org/#account-creator?network=test
# Address: GDYIAJMVUUPZ2PULE4QYGVH6OUMF4I3R3QX5KWZVNQEJHANAWF6IXKOZ

cd soroban-contracts/gacha_game

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/gacha_game.wasm \
  --source gacha-deployer \
  --network testnet

# Copy the contract ID output!
# Update it in:
# - frontend/src/stellar-config.js (line 26)
# - README.md (line 201)
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `soroban-contracts/gacha_game/src/lib.rs` | Main smart contract |
| `frontend/src/stellar-sdk-wrapper.js` | Stellar integration layer |
| `frontend/src/stellar-config.js` | Network configuration |
| `README.md` | Full documentation |
| `SUBMISSION_CHECKLIST.md` | Hackathon submission guide |
| `PROJECT_SUMMARY.md` | What was accomplished |

---

## 🎮 Play the Game (Local)

1. Start frontend: `cd frontend && npm start`
2. Open http://localhost:3000
3. Click "Local Battle Demo" (bottom button)
4. Features available locally:
   - ✅ Character collection
   - ✅ Turn-based battles
   - ✅ Dungeon exploration (WASD)
   - ✅ Equipment system
   - ✅ Boss battles
   - ✅ Loot drops

**Note**: These features currently work with localStorage. Once contract is deployed, they'll use on-chain data.

---

## 🐛 Troubleshooting

### "SSL Certificate Error" during deployment
- **Cause**: Windows certificate trust issue
- **Solution**: Deploy from Linux/WSL/Docker

### "Freighter not found"
- **Solution**: Install Freighter extension

### "No funds"
- **Solution**: Get testnet XLM from friendbot

### "Contract not initialized"
- **Solution**: Run the `initialize` command after deployment

---

## 📞 Get Help

- **Stellar Discord**: https://discord.gg/stellardev
- **Soroban Docs**: https://soroban.stellar.org
- **Freighter Support**: https://freighter.app

---

## ⭐ What Makes This Project Special

1. **Full RPG Game**: Not just a simple NFT - complete with battles, dungeons, equipment
2. **Truly Decentralized**: Characters live on-chain forever
3. **Transparent Randomness**: All probabilities are in the contract
4. **Low Cost**: Stellar's fees make gacha games economically viable
5. **Fast**: 5-second finality for smooth gameplay
6. **Type-Safe**: Rust smart contracts with compile-time guarantees

---

**Built with ❤️ on Stellar Soroban**

For complete details, see [README.md](README.md)
