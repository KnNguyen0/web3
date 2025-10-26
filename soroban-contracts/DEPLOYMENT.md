# Deploying Gacha Game Contract to Stellar

## Prerequisites

- Stellar CLI installed (`stellar --version`)
- Rust toolchain with wasm32 target
- Stellar account with testnet funds

## Build Contract

```bash
cd soroban-contracts/gacha_game
cargo build --target wasm32-unknown-unknown --release
```

## Deploy to Stellar Testnet

### 1. Generate Identity (if needed)

```bash
stellar keys generate gacha-deployer --network testnet
```

### 2. Get Address

```bash
stellar keys address gacha-deployer
```

### 3. Fund Account

Visit https://laboratory.stellar.org/#account-creator?network=test and paste your address to fund it with testnet XLM.

### 4. Deploy Contract

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/gacha_game.wasm \
  --source gacha-deployer \
  --network testnet
```

This will output a contract ID like: `CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 5. Initialize Contract

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source gacha-deployer \
  --network testnet \
  -- \
  initialize \
  --admin <YOUR_ADDRESS> \
  --roll_price 10000000
```

## Contract Functions

### Roll for Character

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source gacha-deployer \
  --network testnet \
  -- \
  roll \
  --player <PLAYER_ADDRESS>
```

### Get Character

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  get_character \
  --token_id 1
```

### Get User's Characters

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  get_user_characters \
  --user <USER_ADDRESS>
```

## Troubleshooting

### SSL Certificate Error on Windows

If you encounter `invalid peer certificate: UnknownIssuer` error:

1. Update Windows root certificates
2. Or use WSL/Linux environment
3. Or deploy using Docker: `docker run --rm -it -v "$(pwd):/workspace" stellar/quickstart:soroban-dev`

### Network Configuration

The testnet RPC endpoint is: `https://soroban-testnet.stellar.org`

You can also deploy to Futurenet or Mainnet by changing `--network` parameter.

## Next Steps

After deployment, update the frontend configuration:
1. Copy the contract ID
2. Update `frontend/src/config.js` with the contract ID
3. Update `frontend/src/App.js` to use Stellar SDK instead of ethers.js
