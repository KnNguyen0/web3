// Stellar SDK Wrapper for Gacha Game

import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';
import { STELLAR_CONFIG, getCurrentNetwork } from './stellar-config';

// Initialize SDK
const network = getCurrentNetwork();
const server = new StellarSdk.SorobanRpc.Server(network.rpcUrl);
const horizonServer = new StellarSdk.Horizon.Server(network.horizonUrl);

/**
 * Check if Freighter wallet is installed
 */
export async function isWalletInstalled() {
  try {
    return await isConnected();
  } catch (error) {
    console.error('Freighter not installed:', error);
    return false;
  }
}

/**
 * Connect to Freighter wallet
 */
export async function connectWallet() {
  try {
    const publicKey = await getPublicKey();
    return publicKey;
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw new Error('Failed to connect to Freighter wallet. Please install Freighter extension.');
  }
}

/**
 * Get account balance
 */
export async function getBalance(address) {
  try {
    const account = await horizonServer.accounts().accountId(address).call();
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
}

/**
 * Initialize the gacha contract
 */
export async function initializeContract(adminAddress) {
  try {
    const userPublicKey = await getPublicKey();
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.contractId);

    // Build transaction
    const account = await server.getAccount(userPublicKey);
    const builtTransaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: network.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'initialize',
          StellarSdk.Address.fromString(adminAddress).toScVal(),
          StellarSdk.nativeToScVal(10_000_000, { type: 'i128' }) // 1 XLM
        )
      )
      .setTimeout(30)
      .build();

    // Simulate and prepare transaction
    const preparedTransaction = await server.prepareTransaction(builtTransaction);

    // Sign with Freighter
    const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
      network: STELLAR_CONFIG.network,
      networkPassphrase: network.networkPassphrase,
    });

    // Submit transaction
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, network.networkPassphrase);
    const response = await server.sendTransaction(tx);

    // Wait for confirmation
    let status = await server.getTransaction(response.hash);
    while (status.status === 'PENDING' || status.status === 'NOT_FOUND') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      status = await server.getTransaction(response.hash);
    }

    return status.status === 'SUCCESS';
  } catch (error) {
    console.error('Failed to initialize contract:', error);
    throw error;
  }
}

/**
 * Roll for a character (mint NFT)
 */
export async function rollCharacter() {
  try {
    const userPublicKey = await getPublicKey();
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.contractId);

    // Build transaction
    const account = await server.getAccount(userPublicKey);
    const builtTransaction = new StellarSdk.TransactionBuilder(account, {
      fee: '10000000', // Higher fee for contract calls
      networkPassphrase: network.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'roll',
          StellarSdk.Address.fromString(userPublicKey).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    // Simulate and prepare transaction
    const preparedTransaction = await server.prepareTransaction(builtTransaction);

    // Sign with Freighter
    const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
      network: STELLAR_CONFIG.network,
      networkPassphrase: network.networkPassphrase,
    });

    // Submit transaction
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, network.networkPassphrase);
    const response = await server.sendTransaction(tx);

    // Wait for confirmation
    let status = await server.getTransaction(response.hash);
    let attempts = 0;
    while ((status.status === 'PENDING' || status.status === 'NOT_FOUND') && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      status = await server.getTransaction(response.hash);
      attempts++;
    }

    if (status.status === 'SUCCESS') {
      // Parse the return value to get character data
      const result = status.returnValue;
      return parseCharacterFromScVal(result);
    }

    throw new Error('Transaction failed');
  } catch (error) {
    console.error('Failed to roll character:', error);
    throw error;
  }
}

/**
 * Get character by ID
 */
export async function getCharacter(tokenId) {
  try {
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.contractId);

    // Build read-only transaction
    const account = await server.getAccount(await getPublicKey());
    const builtTransaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: network.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'get_character',
          StellarSdk.nativeToScVal(tokenId, { type: 'u64' })
        )
      )
      .setTimeout(30)
      .build();

    // Simulate to get result
    const simulationResponse = await server.simulateTransaction(builtTransaction);

    if (simulationResponse.results && simulationResponse.results.length > 0) {
      const result = simulationResponse.results[0].retval;
      return parseCharacterFromScVal(result);
    }

    return null;
  } catch (error) {
    console.error('Failed to get character:', error);
    return null;
  }
}

/**
 * Get user's characters
 */
export async function getUserCharacters(userAddress) {
  try {
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.contractId);

    // Build read-only transaction
    const account = await server.getAccount(await getPublicKey());
    const builtTransaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: network.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'get_user_characters',
          StellarSdk.Address.fromString(userAddress).toScVal()
        )
      )
      .setTimeout(30)
      .build();

    // Simulate to get result
    const simulationResponse = await server.simulateTransaction(builtTransaction);

    if (simulationResponse.results && simulationResponse.results.length > 0) {
      const result = simulationResponse.results[0].retval;
      return parseVectorFromScVal(result);
    }

    return [];
  } catch (error) {
    console.error('Failed to get user characters:', error);
    return [];
  }
}

/**
 * Get total characters minted
 */
export async function getTotalCharacters() {
  try {
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.contractId);

    // Build read-only transaction
    const account = await server.getAccount(await getPublicKey());
    const builtTransaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: network.networkPassphrase,
    })
      .addOperation(contract.call('get_total_characters'))
      .setTimeout(30)
      .build();

    // Simulate to get result
    const simulationResponse = await server.simulateTransaction(builtTransaction);

    if (simulationResponse.results && simulationResponse.results.length > 0) {
      return StellarSdk.scValToNative(simulationResponse.results[0].retval);
    }

    return 0;
  } catch (error) {
    console.error('Failed to get total characters:', error);
    return 0;
  }
}

// Helper function to parse Character struct from ScVal
function parseCharacterFromScVal(scVal) {
  try {
    const character = StellarSdk.scValToNative(scVal);

    // Map Stellar data structure to our format
    return {
      id: Number(character.id),
      rarity: getRarityString(character.rarity),
      power: Number(character.power),
      name: character.name,
      owner: character.owner,
      rolledAt: Number(character.rolled_at)
    };
  } catch (error) {
    console.error('Failed to parse character:', error);
    return null;
  }
}

// Helper function to parse vector from ScVal
function parseVectorFromScVal(scVal) {
  try {
    return StellarSdk.scValToNative(scVal);
  } catch (error) {
    console.error('Failed to parse vector:', error);
    return [];
  }
}

// Map rarity enum to string
function getRarityString(rarity) {
  const rarityMap = {
    0: 'COMMON',
    1: 'RARE',
    2: 'EPIC',
    3: 'LEGENDARY'
  };
  return rarityMap[rarity] || 'COMMON';
}

// Export for use in other components
export { StellarSdk, server, horizonServer };
