# Stellar Gacha RPG - Battle Arena NFT Game

> A blockchain-based gacha RPG game with turn-based combat, dungeon exploration, and NFT character collection built on Stellar's Soroban smart contracts.

## Short Summary

Stellar Gacha RPG: Blockchain gacha game with NFT characters, turn-based battles, dungeon crawling, and equipment system built on Stellar Soroban.

## Full Description

### The Problem It Solves

Traditional gacha games and RPGs suffer from several critical issues:
1. **No True Ownership**: Players don't actually own their in-game characters or items
2. **Centralized Control**: Game companies can shut down servers, erasing all player progress
3. **No Transferability**: Items and characters can't be traded or sold outside the game
4. **Opaque Probabilities**: Drop rates are hidden and can be manipulated
5. **Walled Gardens**: Progress is locked to one game with no interoperability

### Our Solution

Stellar Gacha RPG leverages Stellar's Soroban smart contracts to create a fully decentralized gacha game where:

- **True NFT Ownership**: Every character is an NFT you truly own, stored on Stellar blockchain
- **Transparent Randomness**: All drop rates are encoded in the smart contract and publicly auditable
- **Permanent Existence**: Your characters exist on-chain forever, independent of any centralized server
- **Fast & Affordable**: Stellar's 5-second finality and low transaction costs make gameplay smooth
- **Interoperable**: Characters are standard Soroban tokens that could be used across games

### How We Used Stellar

**Smart Contract Platform**: Built entirely on Soroban (Stellar's smart contract platform) using Rust

**Key Stellar Features Utilized**:
1. **Soroban Contract Storage**: Persistent on-chain storage for character NFTs with efficient TTL management
2. **Stellar Authentication**: Using Freighter wallet for seamless user authentication
3. **Contract Events**: Emitting events for character mints to enable indexing and notifications
4. **Native Token Integration**: Using XLM (stroops) for gacha rolls
5. **Fast Finality**: 5-second confirmation times enable smooth gameplay

## Technical Description

### Architecture

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│  React Frontend │◄────►│  Stellar SDK Wrapper │◄────►│ Soroban Contract│
│   (TypeScript)  │      │    (@stellar/sdk)    │      │    (Rust)       │
└─────────────────┘      └──────────────────────┘      └─────────────────┘
         │                         │                             │
         │                         │                             │
         ▼                         ▼                             ▼
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│ Freighter Wallet│      │  Stellar RPC Server  │      │  Stellar Ledger │
│   (Browser Ext) │      │  (SorobanRpc)        │      │   (Blockchain)  │
└─────────────────┘      └──────────────────────┘      └─────────────────┘
```

### SDKs and Tools Used

1. **@stellar/stellar-sdk (v13.0.0)**: Main JavaScript SDK for interacting with Stellar
   - Contract invocation and transaction building
   - Account management and queries
   - Type conversions between JS and Soroban types

2. **@stellar/freighter-api (v2.0.0)**: Browser wallet integration
   - User authentication and public key retrieval
   - Transaction signing

3. **Soroban SDK (Rust v22.0.0-rc.3)**: Smart contract development
   - Contract macros and types
   - Storage management with TTL
   - Testing utilities

4. **Stellar CLI (v22.0.1)**: Deployment and contract management
   - WASM compilation and optimization
   - Contract deployment to testnet/mainnet
   - Contract invocation for testing

### Why Stellar Made This Possible

1. **Low Transaction Costs**: Gacha games require many small transactions. Stellar's minimal fees (< $0.01) make this economically viable

2. **Fast Finality**: 5-second confirmation times provide a smooth gaming experience without long waiting periods

3. **Soroban's Rust SDK**: Type-safe smart contract development with excellent tooling and compile-time guarantees

4. **Persistent Storage with TTL**: Soroban's storage model with TTL management allows efficient on-chain character storage without excessive costs

5. **Built-in Authentication**: Stellar's account model and Freighter wallet provide seamless authentication without complex auth flows

6. **Mature Ecosystem**: Battle-tested blockchain with 150 TPS real-time capacity and extensive developer documentation

## Smart Contract Details

### Contract Functions

The Soroban contract (`gacha_game`) implements the following key functions:

#### `initialize(admin: Address, roll_price: i128)`
Sets up the contract with an admin address and roll price (in stroops). Can only be called once.

#### `roll(player: Address) -> Character`
Mints a new character NFT with pseudo-random rarity and stats. Returns the minted character.

**Rarity Distribution**:
- Common: 74% (Power: 50-200)
- Rare: 20% (Power: 200-500)
- Epic: 5% (Power: 500-800)
- Legendary: 1% (Power: 800-1000)

#### `get_character(token_id: u64) -> Option<Character>`
Retrieves character details by token ID.

#### `get_user_characters(user: Address) -> Vec<u64>`
Returns all character IDs owned by a user.

#### `get_total_characters() -> u64`
Returns the total number of characters minted.

#### `set_roll_price(caller: Address, new_price: i128)`
Admin-only function to update the roll price.

### Character Data Structure

```rust
pub struct Character {
    pub id: u64,
    pub rarity: Rarity,       // Common, Rare, Epic, Legendary
    pub power: u32,
    pub name: String,
    pub owner: Address,
    pub rolled_at: u64,       // Timestamp
}
```

### Randomness

The contract uses pseudo-random number generation based on:
- Ledger timestamp
- Ledger sequence number
- Token ID seed
- User input parameters

**Note**: For production, this should be replaced with Chainlink VRF or similar oracle for true randomness.

### Storage Optimization

- Uses `persistent` storage for character data
- Uses `instance` storage for contract configuration
- Implements TTL extension (50-100 ledgers) to maintain data availability
- Efficient Symbol-based keys to minimize storage costs

## Demo

### Demo Video
*[TODO: Add Loom video link here showing full gameplay walkthrough]*

The demo video includes:
- Connecting Freighter wallet to the game
- Rolling for characters with different rarities
- Viewing character collection
- Turn-based battle system demonstration
- Dungeon exploration with WASD movement
- Equipment system and inventory management
- Boss battles with enhanced loot drops

### Screenshots

#### Main Gacha Screen
![Gacha Roll Screen](docs/screenshots/gacha-screen.png)
*Roll for random NFT characters with transparent drop rates*

#### Character Collection
![Character Collection](docs/screenshots/collection.png)
*View all your owned characters with stats and rarity*

#### Battle Arena
![Battle System](docs/screenshots/battle.png)
*Turn-based combat with type advantages*

#### Dungeon Map
![Dungeon Exploration](docs/screenshots/dungeon.png)
*Explore procedurally generated dungeons with WASD controls*

#### Equipment System
![Equipment Screen](docs/screenshots/equipment.png)
*Equip weapons, armor, and accessories to boost stats*

### Live Demo Site

🌐 **[Play Now: stellar-gacha-rpg.netlify.app](https://stellar-gacha-rpg.netlify.app)**

*Note: Requires Freighter wallet extension and Stellar testnet XLM*

## Block Explorer

📊 **Contract on Stellar Expert**:
[View Contract](https://stellar.expert/explorer/testnet/contract/[CONTRACT_ID])

**Contract ID**: `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

*[TODO: Update with actual deployed contract ID]*

## Repository Structure

```
stellar-gacha-rpg/
├── soroban-contracts/
│   ├── gacha_game/
│   │   ├── src/
│   │   │   └── lib.rs              # Main Soroban contract
│   │   ├── Cargo.toml              # Rust dependencies
│   │   └── target/
│   │       └── wasm32-unknown-unknown/
│   │           └── release/
│   │               └── gacha_game.wasm  # Compiled WASM contract
│   └── DEPLOYMENT.md               # Deployment instructions
│
├── frontend/
│   ├── src/
│   │   ├── App.js                  # Main React component (legacy Ethereum)
│   │   ├── LocalBattleDemo.js      # Battle & character management
│   │   ├── BattleArena.js          # Turn-based combat system
│   │   ├── DungeonMap.js           # Dungeon exploration
│   │   ├── stellar-config.js       # Stellar network configuration
│   │   ├── stellar-sdk-wrapper.js  # Stellar SDK integration layer
│   │   └── *.css                   # Styling
│   ├── public/
│   └── package.json                # Frontend dependencies
│
├── contracts/                      # Legacy Ethereum contracts (deprecated)
├── scripts/                        # Deployment scripts
├── README.md                       # This file
└── package.json                    # Root dependencies
```

## Features

### Core Gameplay

✅ **Gacha System**: Roll for random NFT characters with transparent probabilities
✅ **Character Collection**: View and manage all your characters
✅ **Turn-Based Combat**: Strategic battles with 3 attack types (Light, Medium, Heavy)
✅ **Type System**: Elemental advantages (Fire, Water, Electric, Earth, Dark, Light)
✅ **Equipment System**: Weapons, armor, and accessories with stat bonuses
✅ **Inventory Management**: Collect and manage loot drops
✅ **Dungeon Exploration**: 6 unique dungeons with procedural maps
✅ **Boss Battles**: Challenging boss fights with better loot
✅ **Rarity Tiers**: 4 rarity levels with different power levels

### Blockchain Features

✅ **Soroban Smart Contracts**: All game logic on-chain in Rust
✅ **NFT Ownership**: True ownership of characters
✅ **Freighter Wallet Integration**: Seamless authentication
✅ **Transparent Probabilities**: Verifiable drop rates
✅ **On-Chain Storage**: Permanent character data
✅ **Event Emissions**: Contract events for indexing
✅ **XLM Payments**: Native Stellar token integration

## Getting Started

### Prerequisites

- Node.js v16+
- Rust toolchain with wasm32 target
- Stellar CLI (`stellar`)
- Freighter wallet browser extension

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/stellar-gacha-rpg.git
cd stellar-gacha-rpg
```

2. **Install frontend dependencies**:
```bash
cd frontend
npm install
```

3. **Build the Soroban contract**:
```bash
cd ../soroban-contracts/gacha_game
cargo build --target wasm32-unknown-unknown --release
```

### Running Locally

1. **Start the frontend**:
```bash
cd frontend
npm start
```

2. **Install Freighter wallet**:
   - Add [Freighter extension](https://www.freighter.app/) to your browser
   - Create or import a wallet
   - Switch to Stellar testnet
   - Get testnet XLM from [friendbot](https://laboratory.stellar.org/#account-creator?network=test)

3. **Connect and play**:
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Approve the connection in Freighter
   - Start rolling for characters!

## Deployment

See [DEPLOYMENT.md](soroban-contracts/DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Stellar testnet:

```bash
cd soroban-contracts/gacha_game

# Deploy contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/gacha_game.wasm \
  --source your-identity \
  --network testnet

# Initialize contract
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source your-identity \
  --network testnet \
  -- initialize \
  --admin <YOUR_ADDRESS> \
  --roll_price 10000000
```

## Testing

### Smart Contract Tests

```bash
cd soroban-contracts/gacha_game
cargo test
```

All tests should pass:
- ✅ `test_initialize`: Contract initialization
- ✅ `test_roll_character`: Character minting
- ✅ `test_multiple_rolls`: Multiple character mints

## Project Presentation

📊 **Canva Presentation**: [View Slides](https://www.canva.com/design/YOUR_DESIGN_ID)

Our presentation covers:
1. **Team Introduction**: Who we are and our background
2. **Problem Statement**: Issues with traditional gacha games
3. **Solution Overview**: How Stellar Gacha RPG solves these problems
4. **Technical Architecture**: Deep dive into Soroban integration
5. **Demo Walkthrough**: Live gameplay demonstration
6. **Future Roadmap**: Upcoming features and improvements
7. **Q&A**: Questions and answers

## Future Enhancements

- [ ] **True Randomness**: Integrate Chainlink VRF oracle for verifiable randomness
- [ ] **PvP Battles**: Player vs player combat mode
- [ ] **Marketplace**: Trade characters and equipment
- [ ] **Guilds**: Team up with other players
- [ ] **Staking**: Earn rewards by staking characters
- [ ] **Cross-Chain Bridge**: Enable character transfers across chains
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Character Breeding**: Combine characters to create new ones
- [ ] **Tournaments**: Competitive events with prizes
- [ ] **Achievement NFTs**: Special NFTs for milestones

## Technology Stack

**Blockchain**:
- Stellar Soroban (Smart Contracts)
- Stellar SDK (JavaScript)
- Freighter (Wallet)

**Smart Contracts**:
- Rust 1.90
- Soroban SDK 22.0
- WASM compilation

**Frontend**:
- React 19
- JavaScript/ES6
- CSS3

**Development Tools**:
- Stellar CLI 22.0
- Cargo (Rust package manager)
- npm/Node.js

## Security Considerations

⚠️ **This is a demonstration project**. For production deployment:

1. **Randomness**: Replace pseudo-random with Chainlink VRF
2. **Access Control**: Implement role-based permissions
3. **Rate Limiting**: Add cooldowns to prevent spam
4. **Audit**: Get smart contracts audited by professionals
5. **Testing**: Add comprehensive integration and stress tests
6. **Gas Optimization**: Optimize contract for minimal fees
7. **Upgrade Path**: Implement contract upgradeability
8. **Emergency Pause**: Add circuit breaker functionality

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Team

- **[Your Name]** - Lead Developer - [GitHub](https://github.com/yourusername)
- *Add your team members here*

## Support

- 📧 Email: support@stellar-gacha-rpg.com
- 💬 Discord: [Join our server](https://discord.gg/yourserver)
- 🐦 Twitter: [@StellarGachaRPG](https://twitter.com/StellarGachaRPG)
- 📖 Documentation: [docs.stellar-gacha-rpg.com](https://docs.stellar-gacha-rpg.com)

## Acknowledgments

- Stellar Development Foundation for Soroban
- Freighter team for the excellent wallet
- OpenZeppelin for security best practices
- Stellar community for support and feedback

---

**Built with ❤️ on Stellar**

⭐ Star this repo if you like the project!
