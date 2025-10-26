# Stellar Hackathon Submission Checklist

## ✅ Completed Items

- [x] **Smart Contract on Stellar**: Soroban contract built in Rust (`soroban-contracts/gacha_game/`)
- [x] **Open Source**: Repository is public and will remain open source
- [x] **Short Summary**: "Stellar Gacha RPG: Blockchain gacha game with NFT characters, turn-based battles, dungeon crawling, and equipment system built on Stellar Soroban." (139 chars)
- [x] **Full Description**: Comprehensive problem/solution explanation in README.md
- [x] **Technical Description**: SDKs, tools, and Stellar features documented in README.md
- [x] **Custom Smart Contract**: Fully custom gacha game contract (not boilerplate)
- [x] **Smart Contract in Repo**: Contract code committed to `soroban-contracts/gacha_game/src/lib.rs`
- [x] **README Created**: Detailed README.md with all required sections
- [x] **Contract Description**: Smart contract functions and architecture documented
- [x] **Repository Structure**: Clear repo structure explained in README

## 🚧 Remaining Tasks

### 1. Deploy Contract & Get Block Explorer Link

**Status**: Contract built and ready to deploy

**Steps**:
```bash
# Fund your account with testnet XLM
# Visit: https://laboratory.stellar.org/#account-creator?network=test
# Paste address: GDYIAJMVUUPZ2PULE4QYGVH6OUMF4I3R3QX5KWZVNQEJHANAWF6IXKOZ

# Deploy the contract
cd soroban-contracts/gacha_game
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/gacha_game.wasm \
  --source gacha-deployer \
  --network testnet

# Copy the contract ID output and update:
# 1. frontend/src/stellar-config.js (line 26)
# 2. README.md (line 201)
```

**Block Explorer URL Format**:
```
https://stellar.expert/explorer/testnet/contract/[YOUR_CONTRACT_ID]
```

**If SSL Error on Windows**:
- Try deployment from WSL or Linux VM
- Or use Docker: `docker run -it stellar/quickstart:soroban-dev`
- Or have user deploy from their machine with proper SSL certs

---

### 2. Create Demo Video

**Required Content**:
- Show Freighter wallet connection
- Roll for characters (show different rarities)
- View character collection
- Demonstrate turn-based battle
- Show dungeon exploration with WASD
- Display equipment system
- Boss battle with loot drops
- Show contract interaction (transactions in Freighter)

**Recording Tools**:
- [Loom](https://www.loom.com/) - Easy browser recording
- OBS Studio - More professional
- Screen recording built into Windows (Win + G)

**Steps**:
1. Install Freighter wallet extension
2. Get testnet XLM from friendbot
3. Start the frontend: `cd frontend && npm start`
4. Start recording
5. Walk through all features (5-10 minutes)
6. Upload to Loom or YouTube
7. Get shareable link
8. Update README.md line 157 with video URL

---

### 3. Take UI Screenshots

**Screenshots Needed** (save to `docs/screenshots/`):
1. `gacha-screen.png` - Main character roll screen
2. `collection.png` - Character collection view
3. `battle.png` - Turn-based battle interface
4. `dungeon.png` - Dungeon map exploration
5. `equipment.png` - Equipment and inventory screen

**How to Take Screenshots**:
- Windows: Win + Shift + S
- Mac: Cmd + Shift + 4
- Or use browser DevTools screenshot feature

**Steps**:
1. Create directory: `mkdir -p docs/screenshots`
2. Start the app and navigate to each screen
3. Take clean, clear screenshots
4. Save with the names above
5. Screenshots are already referenced in README.md (lines 171-187)

---

### 4. Create Canva Presentation

**Template**: https://www.canva.com/design/DAG1V0C2kmI/wOyAqaOENl-IoxaHHbDDjA/edit

**Required Slides**:
1. **Title Slide**: Project name + tagline
2. **Team**: Who built it (name, role, photo optional)
3. **Problem**: What issues does it solve?
4. **Solution**: How does your project work?
5. **Technical Architecture**: Diagram + tech stack
6. **Stellar Integration**: How you used Soroban specifically
7. **Demo**: Screenshots or demo link
8. **Future Roadmap**: What's next?

**Steps**:
1. Create account on Canva
2. Use the provided template (stick to the structure)
3. Add your content and screenshots
4. Make it visually appealing
5. Get shareable link
6. Update README.md line 352 with Canva URL

---

### 5. Record Walkthrough Video (Loom)

**Purpose**: Explain project structure and how everything works

**Required Content**:
- Introduction to the project
- GitHub repo structure walkthrough
- Explain smart contract code (`lib.rs`)
- Show how Stellar SDK is integrated
- Demonstrate how deployment works
- Walk through frontend code
- Explain key technical decisions
- Show tests passing
- Demo the working application

**Length**: 5-15 minutes

**Steps**:
1. Open your IDE with the project
2. Start Loom recording (screen + audio)
3. Walk through repo explaining each part
4. Show terminal commands for build/test/deploy
5. Explain the Soroban contract functions
6. Show how frontend connects to Stellar
7. Upload to Loom
8. Get shareable link
9. Update README.md with link (create new section)

---

### 6. Deploy Demo Site

**Options**:

**A. Netlify (Recommended)**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the frontend
cd frontend
npm run build

# Deploy
netlify deploy --prod
```

**B. Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**C. GitHub Pages**:
```bash
# Add to frontend/package.json:
"homepage": "https://yourusername.github.io/stellar-gacha-rpg",

# Build and deploy
npm run build
npx gh-pages -d build
```

**After Deployment**:
1. Get the live URL
2. Update README.md line 192 with actual URL
3. Test that it works end-to-end
4. Make sure Freighter wallet can connect

---

## Final Verification

Before submitting, verify:

- [ ] Contract deployed to Stellar testnet
- [ ] Block explorer link working
- [ ] Demo video uploaded and publicly accessible
- [ ] Loom walkthrough video uploaded and publicly accessible
- [ ] Screenshots in repo (docs/screenshots/)
- [ ] Canva presentation created and link works
- [ ] Demo site deployed and accessible
- [ ] README has all links updated (no TODOs)
- [ ] All code committed and pushed to GitHub
- [ ] Repository is public

## Submission Format

When you submit, include:

1. **GitHub Repository URL**: `https://github.com/yourusername/stellar-gacha-rpg`
2. **Demo Site URL**: `https://your-app.netlify.app`
3. **Demo Video URL**: `https://www.loom.com/share/YOUR_VIDEO_ID`
4. **Canva Presentation**: `https://www.canva.com/design/YOUR_DESIGN_ID`
5. **Contract ID**: `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
6. **Block Explorer**: `https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID`

## Tips for Success

1. **Make Video Engaging**: Show enthusiasm! Explain why this is cool.
2. **Clean Screenshots**: Make sure UI looks polished
3. **Test Everything**: Verify all links work before submitting
4. **Tell a Story**: In your video, explain the journey and challenges
5. **Highlight Stellar Features**: Emphasize what makes Stellar perfect for this
6. **Show Real Usage**: Actually use the app in your demo, don't just explain

## Support Resources

- **Stellar Discord**: https://discord.gg/stellardev
- **Soroban Docs**: https://soroban.stellar.org
- **Freighter Wallet**: https://www.freighter.app/
- **Stellar Laboratory**: https://laboratory.stellar.org

---

Good luck with your submission! 🚀
